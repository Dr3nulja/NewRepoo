import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3100;

app.get('/', (req,res) => {
    res.json({message: 'ok'})
})

app.listen(PORT, () => {
    console.log(`Server on port ${PORT}`);
})