<template>
    <div>
        <div class="display-area">
            <RouterView />
        </div>
    </div>
</template>

<script>

export default {
    name: 'YDisplayarea',
    props: {
        displayUrl: {
            type: String,
            required: true,
            default: '/greeting'
        },
    },
    emits: [
        'opened-playlist',
        'newDisplayUrl',
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
        currentIndex(newIndex) {
            this.$router.push(this.history[newIndex]);
        }
    },
    mounted() {
        window.addEventListener('popstate', this.handlePopState);
        window.addEventListener('message', this.handleMessage);
        this.$router.push({ path: '/greeting' });
    },
    beforeUnmount() {
        window.removeEventListener('popstate', this.handlePopState);
        window.removeEventListener('message', this.handleMessage);
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