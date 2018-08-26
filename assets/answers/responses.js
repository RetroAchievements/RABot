const hi = 'Hi there! 👋';
const gnight = 'sleep well... 😴';
const gmorning = 'good morning! 🌄';

const pfp = "**So you've changed your profile picture on the site and it wasn't updated yet? You just need to clear the cache of your browser. Most of the cases hitting Ctrl+F5 is enough.**";

module.exports = {
    'hi there': hi,
    'hello': hi,
    'hello guys': hi,
    'hi guys': hi,

    'good night here': gnight,
    'gnight': gnight,
    'g\'night here': gnight,
    'gnight here': gnight,
    
    'morning guys': gmorning,
    'good morning': gmorning,
    'good morning guys': gmorning,
    'gmorning': gmorning,
    'g\'morning': gmorning,

    '!pfp': pfp, // a workaround to pretend it's a command
    'pfp': pfp,
}
