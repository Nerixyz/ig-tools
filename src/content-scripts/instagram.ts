const globalObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        const added = Array.from(mutation.addedNodes) as HTMLElement[];
        const post = added.find(x => x.tagName === 'ARTICLE' && x.classList.contains('M9sTE'));
        if (post) {
            handleAddedPost(post);
            continue;
        }

        const story = added.find(x => (x.tagName === 'SECTION' && x.classList.contains('_8XqED')) || (x.tagName === 'DIV' && x.classList.contains('qbCDp')));
        if (story) {
            const actualStory = story.classList.contains('qbCDp') ? document.querySelector('section._9eogI._01nki section._8XqED') : story;
            if (!actualStory) continue;
            handleStory(actualStory);
            continue;
        }

        const timeline = added.find(x => x.classList.contains('sH9wk') || x.classList.contains('E3X2T'));
        if(timeline) {
            const posts = document.querySelectorAll('article.M9sTE');
            posts.forEach(el => handleAddedPost(el));
        }
    }
});
globalObserver.observe(document, {childList: true, subtree: true});

function handleStory(story: Element) {
    const header = story.querySelector('header .aOX72');
    const content = story.querySelector('.GHEPc');
    if (!header || !content || Reflect.get(header, '__ext_known')) return;
    Reflect.set(header, '__ext_known', true);

    header.append(createStoryButton(content));
}

function handleAddedPost(post: Element) {
    if (!post || Reflect.get(post, '__ext_known')) return;
    Reflect.set(post, '__ext_known', true);

    const buttons = post.querySelector('section.ltpMr.Slqrh');
    const actualMedia = post.querySelector('div._97aPb');
    if (!buttons || !actualMedia || !buttons.lastChild) return;

    buttons.insertBefore(createPostButton(actualMedia), buttons.lastChild);
}

function createPostButton(context: Element): HTMLElement {
    return createBaseButton(() => {
        const ul = context.getElementsByTagName('ul');
        if (ul.length) return handleAlbum(ul.item(0) as HTMLUListElement);
        handleNearestMedia(context);
    });
}

function createStoryButton(context: Element): HTMLElement {
    return createBaseButton(() => handleNearestMedia(context));
}

function createBaseButton(onClick: () => void): HTMLElement {
    const btn = document.createElement('button');
    btn.innerHTML = `
    <svg style="width:24px;height:24px" viewBox="0 0 24 24">
        <path fill="currentColor" d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z" />
    </svg>`;
    btn.classList.add('wpO6b');
    btn.onclick = onClick;
    return btn;
}

function handleAlbum(ul: HTMLUListElement) {
    const buttons = Array.from(ul.parentElement?.parentElement?.parentElement?.children ?? []).filter(x => x instanceof HTMLButtonElement);
    const hasBack = buttons.some(x => x.classList.contains('POSa_'));
    const hasForth = buttons.some(x => x.classList.contains('_6CZji'));
    const [first, second] = Array.from(ul.children).filter(x => x.classList.contains('Ckrof'));
    let target = first;
    if (hasBack && hasForth) target = second;
    else if (hasForth) target = first;
    else if (hasBack) target = second;

    handleNearestMedia(target);
}

function handleNearestMedia(el: Element) {
    const video = el.getElementsByTagName('video');
    if (video.length) return handleVideo(video.item(0) as HTMLVideoElement);
    return handleImage(el.getElementsByTagName('img').item(0) as HTMLImageElement);
}

function handleVideo(video: HTMLVideoElement) {
    window.open(video.src || (Array.from(video.children).find(x => x instanceof HTMLSourceElement) as HTMLSourceElement | undefined)?.src, '_blank');
}

function handleImage(image: HTMLImageElement) {
    window.open(image.src, '_blank');
}


