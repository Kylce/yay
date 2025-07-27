const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const fs = require('fs');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });
app.use(cors());
app.use(express.json());

app.post('/analyze', upload.single('audio'), async (req, res) => {
    try {
        const audioPath = req.file.path;
        const scriptPath = path.join(__dirname, 'audio_analysis.py');
        const pythonCmd = `python ${scriptPath} ${audioPath}`;

        exec(pythonCmd, async (error, stdout, stderr) => {
            if (error) return res.status(500).json({ error: stderr });

            const analysisData = JSON.parse(stdout);
            const prompt = `Analyze this voice data: ${JSON.stringify(analysisData)}`;

            const response = await axios.post(
                'https://api-inference.huggingface.co/models/google/flan-t5-large',
                { inputs: prompt },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            fs.unlinkSync(audioPath);
            return res.json({ result: response.data });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server listening on port ${PORT}`));
