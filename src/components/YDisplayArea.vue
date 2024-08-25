<template>
    <div>
        <iframe class="display-area" :src="currentUrl" scrolling="no" ref="myIframe"></iframe>
    </div>
</template>

<script>

export default {
    name: 'YDisplayarea',
    props: {
        displayUrl: {
            type: String,
            required: true,
            default: 'http://localhost:4321/greeting'
        },
    },
    emits: [
        'opened-playlist',
        'newDisplayUrl',
        'iframe-click',
        'iframe-mousemove',
        'iframe-mouseup'
    ],
    data() {
        return {
            history: [this.displayUrl],
            currentIndex: 0
        };
    },
    computed: {
        currentUrl() {
            return this.history[this.currentIndex];
        }
    },
    watch: {
        displayUrl(newUrl) {
            if (newUrl !== this.currentUrl) {
                this.history.push(newUrl);
                this.currentIndex = this.history.length - 1;
                window.history.pushState({ index: this.currentIndex }, '', '');
            }
        },
    },
    mounted() {
        window.addEventListener('popstate', this.handlePopState);
        window.addEventListener('message', this.handleMessage);
        this.$refs.myIframe.onload = () => {
            const iframeWindow = this.$refs.myIframe.contentWindow;
            // 监听 iframe 内部的点击事件
            iframeWindow.addEventListener('click', this.handleIframeClick);
            // 监听 iframe 内部的鼠标移动事件
            iframeWindow.addEventListener('mousemove', this.handleIframeMouseMove);
            // 监听 iframe 内部的鼠标抬起事件
            iframeWindow.addEventListener('mouseup', this.handleIframeMouseUp);
        };
    },
    beforeUnmount() {
        window.removeEventListener('popstate', this.handlePopState);
        window.removeEventListener('message', this.handleMessage);
        // 在组件销毁前移除事件监听器以防止内存泄漏
        const iframeWindow = this.$refs.myIframe.contentWindow;
        if (iframeWindow) {
            iframeWindow.removeEventListener('click', this.handleIframeClick);
            iframeWindow.removeEventListener('mousemove', this.handleIframeMouseMove);
            iframeWindow.removeEventListener('mouseup', this.handleIframeMouseUp);
        }
    },
    methods: {
        handleMessage(event) {
            if (event.origin !== 'http://localhost:4321') {
                return;
            }
            const { type, color } = event.data;
            if (type === 'set-background-color') {
                // console.log('Received message from YPlaylistView:', color);

                const backgroundDOM = document.querySelector('.mainContainer');
                backgroundDOM.style.background = `linear-gradient(180deg, ${color} 0%,  #131319 500px, #131319 100%)`;
            }
        },
        handlePopState(event) {
            if (event.state && event.state.index !== undefined) {
                this.currentIndex = event.state.index;
            }
        },
        navigateBack() {
            if (this.currentIndex > 0) {
                this.currentIndex--;
                window.history.pushState({ index: this.currentIndex }, '', '');
            }
        },
        navigateForward() {
            if (this.currentIndex < this.history.length - 1) {
                this.currentIndex++;
                window.history.pushState({ index: this.currentIndex }, '', '');
            }
        },
        handleIframeClick(event) {
            event = this.adjustEvent(event);
            this.$refs.myIframe.contentWindow.parent.postMessage({
                type: 'iframe-click',
                data: event,
            }, '*');
        },
        handleIframeMouseMove(event) {
            event = this.adjustEvent(event);
            this.$refs.myIframe.contentWindow.parent.postMessage({
                type: 'iframe-mouse-move',
                data: event,
            }, '*');
        },
        handleIframeMouseUp(event) {
            event = this.adjustEvent(event);
            this.$refs.myIframe.contentWindow.parent.postMessage({
                type: 'iframe-mouse-up',
                data: event,
            }, '*');
        },
        adjustEvent(event) {
            const { left, top } = this.$refs.myIframe.getBoundingClientRect();
            return {
                ...event,
                adjustX: event.clientX + left,
                adjustY: event.clientY + top,
            };
        },
    }
};
</script>

<style scoped>
.display-area {
    border: none;
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
    z-index: 1;
    overflow: hidden;
}
</style>