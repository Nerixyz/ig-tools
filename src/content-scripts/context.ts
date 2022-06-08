const POST_CLASS = '_aatb';
const POST_BUTTONS_SELECTOR = 'section._aat0._aat1,section._aamu._aat0'; // timeline, modal
const POST_BODY_SELECTOR = 'div._aatk';

const TIMELINE_OUTER = '_aalz';
const TIMELINE_INNER = '_abc0';

const STORY_NODE_WRAPPER = '_aa64'; // the added node, not really the wrapper
const STORY_MODAL_SELECTOR = 'section._ac6a._ac0e section._ac0a';
const STORY_HEADER_SELECTOR = 'header._ac0k ._ac0m';
const STORY_CONTENT_SELECTOR = '._aa65';

const BUTTON_LIKE_CLASS = '_abl-';

const ALBUM_BUTTON_BACK_CLASS = '_aahh';
const ALBUM_BUTTON_FORTH_CLASS = '_aahi';
const ALBUM_LI_CLASS = '_acaz';

const globalObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        const added = Array.from(mutation.addedNodes) as HTMLElement[];
        const post = added.find(x =>
            x.tagName === 'ARTICLE' &&
            x.classList?.contains(POST_CLASS));
        if (post) {
            handleAddedPost(post);
            continue;
        }

        const timeline = added.find(x =>
            x.classList?.contains(TIMELINE_OUTER) ||
            x.classList?.contains(TIMELINE_INNER) ||
            x.classList?.contains(POST_CLASS)
        );
        if(timeline) {
            const posts = document.querySelectorAll(`article.${POST_CLASS}`);
            posts.forEach(el => handleAddedPost(el));
        }

        const newStory = added.find(x => x.classList?.contains(STORY_NODE_WRAPPER));
        if (newStory) {
            const actualStory = document.querySelector(STORY_MODAL_SELECTOR);
            if (actualStory) {
                handleStory(actualStory);
            }
        }
    }
});
globalObserver.observe(document, {childList: true, subtree: true});
function handleStory(story: Element) {
    const header = story.querySelector(STORY_HEADER_SELECTOR);
    const content = story.querySelector(STORY_CONTENT_SELECTOR);
    if (!header || !content || isMarked(header)) return;
    mark(header);

    header.prepend(createStoryButton(`${STORY_MODAL_SELECTOR} ${STORY_CONTENT_SELECTOR}`, true));
}

function handleAddedPost(post: Element) {
    if (!post || isMarked(post)) return;
    mark(post);

    const buttons = post.querySelector(POST_BUTTONS_SELECTOR);
    const actualMedia = post.querySelector(POST_BODY_SELECTOR);
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

function createStoryButton(context: Element | string, small = false): HTMLElement {
    return createBaseButton(() => handleNearestMedia(
        typeof context === 'string' ? document.querySelector(context) ?? document.documentElement : context),
        small ? '20px' : '24px');
}

function createBaseButton(onClick: () => void, size = '24px'): HTMLElement {
    const btn = document.createElement('button');
    btn.innerHTML = `
    <svg style="width:${size};height:${size}" viewBox="0 0 24 24">
        <path fill="currentColor" d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z" />
    </svg>`;
    btn.classList.add(BUTTON_LIKE_CLASS);
    btn.onclick = onClick;
    return btn;
}

function handleAlbum(ul: HTMLUListElement) {
    const buttons = Array.from(ul.parentElement?.parentElement?.parentElement?.children ?? []).filter(x => x instanceof HTMLButtonElement);
    const hasBack = buttons.some(x => x.classList.contains(ALBUM_BUTTON_BACK_CLASS));
    const hasForth = buttons.some(x => x.classList.contains(ALBUM_BUTTON_FORTH_CLASS));
    const [first, second] = Array.from(ul.children).filter(x => x.classList.contains(ALBUM_LI_CLASS));
    let target = first;
    if (hasBack && hasForth) target = second;
    else if (hasForth) target = first;
    else if (hasBack) target = second;

    handleNearestMedia(target);
}

function handleNearestMedia(el: Element) {
    const video = el.getElementsByTagName('video');
    if (video.length) {
        if(video.item(0)?.src?.startsWith('blob'))
            return handleNewVideo(video.item(0) as HTMLVideoElement);

        return handleVideo(video.item(0) as HTMLVideoElement);
    }
    return handleImage(el.getElementsByTagName('img').item(0) as HTMLImageElement);
}

function handleVideo(video: HTMLVideoElement) {
    window.open(video.src || (Array.from(video.children).find(x => x instanceof HTMLSourceElement) as HTMLSourceElement | undefined)?.src, '_blank');
}

function handleNewVideo(video: HTMLVideoElement) {
    const props = findProps(video);
    if(props) {
        window.open(props.videoUrl, '_blank');
    }
}

function findProps(start: HTMLElement): {videoUrl: string} | undefined {
    let el: HTMLElement | null = start;
    do {
        if(!el) return;

        const react = findReactEventHandlersProperty(el);
        if(react) {
            if((el as any)[react].children?.props?.post?.videoUrl) {
                return (el as any)[react].children.props.post;
            }
        }
        el = el.parentElement;
    } while (el && el.tagName !== 'ARTICLE');
}

function findReactEventHandlersProperty(el: HTMLElement): string | undefined {
    return Object.keys(el).find(x => x.startsWith('__reactEventHandlers'))
}

function handleImage(image: HTMLImageElement) {
    window.open(image.src, '_blank');
}

const MARKER = Symbol("ig-tool-known");
function mark(el: Element) {
    Object.defineProperty(el, MARKER, { enumerable: false, configurable: false, writable: false, value: true });
}
function isMarked(el: Element & { [MARKER]?: boolean }): boolean {
    return !!el[MARKER];
}


