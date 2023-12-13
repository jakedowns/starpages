// Helper function to check if a URL contains a certain keyword
function checkUrl(uri, keyword) {
    return uri?.includes?.(keyword);
}

// Handlers for different types of URLs
const urlHandlers = {
    'soundcloud.com': uri => {
        const MySoundCloudClass = class extends SoundCloudWidget {
            url = uri
        }
        return system.registerWidget(new MySoundCloudClass())
    },
    'youtube.com/': uri => handleYoutube(uri),
    'youtu.be': uri => handleYoutube(uri),
    // '://': uri => system.registerWidget(new iFrameWidget(uri))
};

// Add image handlers in a loop to reduce redundancy
['.png', '.jpg', '.gif', '.jpeg', '.webp'].forEach(ext => {
    urlHandlers[ext] = uri => system.registerWidget(new ImageViewerWidget(uri));
});

// Handler for YouTube URLs
function handleYoutube(uri) {
    let updatedUrl = uri;
    try {
        let url = new URL(updatedUrl);
        updatedUrl = url.toString();
    } catch (error) {
        console.error('Invalid URL:', updatedUrl);
    }
    return system.registerWidget(new YoutubePlayerWidget("", {tracks: [updatedUrl]}));
}

// Refactored tryInvokeHandlerForUri function
function tryInvokeHandlerForUri(uri) {
    console.warn('tryInvokeHandlerForUri', {uri});

    // Check if the URL matches any of the handlers
    for (let keyword in urlHandlers) {
        if (checkUrl(uri, keyword)) {
            return urlHandlers[keyword](uri);
        }
    }

    // If none of the above, check if it's a generic URL and handle it as an iframe
    if (uri?.includes?.("://")) {
        return system.registerWidget(new iFrameWidget(uri));
    }

    // If no handler matched, try to invoke a command
    try {
        let result = InvokableCommands[uri];
        if (typeof result === 'string') {
            return this.tryInvokeHandlerForUri(result);
        } else if (typeof result === 'function') {
            return result.call(result);
        } else {
            console.warn(`tryInvoke ${uri}`, typeof result, result);
        }
        if (result) {
            return result;
        }
    } catch(e) {
        console.error("error trying string as command ", e);
        throw e;
    }

    return -1000;
}