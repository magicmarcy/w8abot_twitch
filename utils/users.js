import rp from 'request-promise';
export function getChatters(channelName, _attemptCount = 0) {
    return rp({
        uri: `https://tmi.twitch.tv/group/user/${channelName}/chatters`,
        json: true
    })
        .then(data => {
            return Object.entries(data.chatters)
                .reduce((p, [ type, list ]) => p.concat(list.map(name => {
                    if(name === channelName) type = 'broadcaster';
                    return { name, type };
                })), []);
        })
        .catch(err => {
            if(_attemptCount < 3) {
                return getChatters(channelName, _attemptCount + 1);
            }
            throw err;
        })
}

export function getRandomChatter(channelName, opts = {}) {
    let {
        onlyViewers = true,
        noBroadcaster = true,
        skipList = []
    } = opts;
    return getChatters(channelName)
        .then(data => {
            let chatters = data
                .filter(({ name, type }) =>
                    !(
                        (onlyViewers && type !== 'viewers') ||
                        (noBroadcaster && type === 'broadcaster') ||
                        skipList.includes(name)
                    )
                );
            return chatters.length === 0 ?
                null :
                chatters[Math.floor(Math.random() * chatters.length)];
        });
}
