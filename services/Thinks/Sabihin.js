import tts from '@google-cloud/text-to-speech';
const client = new tts.TextToSpeechClient();

const getSabihin = async text => {
    const request = {
        input: { text },
        voice: {
            languageCode: 'fil-PH',
            name: 'fil-PH-Wavenet-C'
        },
        audioConfig: {
            audioEncoding: 'OGG_OPUS'
        }
    };

    const [response] = await client.synthesizeSpeech(request);
    return Buffer.from(response.audioContent, 'base64');
};

export {
    getSabihin
};
