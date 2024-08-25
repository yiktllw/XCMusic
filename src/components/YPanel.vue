<template>
    <div v-show="showPanel" class="panel" ref="panel">
        <slot>

        </slot>
    </div>
</template>

<script lang="js">
export default {
    name: 'YPanel',
    data() {
        return {
            showPanel: false,
        }
    },
    props: {
        trigger: {
            type: Element,
            default: null,
        }
    },
    watch: {
        showPanel(val) {
            if (val) {
                window.addEventListener('click', this.handleClickOutside);
                window.addEventListener('message', this.handleMessage);
            } else {
                window.removeEventListener('click', this.handleClickOutside);
                window.removeEventListener('message', this.handleMessage);
            }
        }
    },
    methods: {
        tooglePanel() {
            this.showPanel = !this.showPanel;
        },
        _showPanel() {
            this.showPanel = true;
        },
        closePanel() {
            this.showPanel = false;
        },
        handleMessage(event) {
            if (event.data.type === 'iframe-click' && this.showPanel) {
                this.showPanel = false;
                console.log('handleMessage and close panel',event.data);
            }
        },
        handleClickOutside(event) {
            console.log('handleClickOutside');
            if (this.$refs.panel && !this.$refs.panel.contains(event.target) && this.trigger && !this.trigger.contains(event.target) && this.showPanel) {
                this.showPanel = false;
                console.log('handleClickOutside and close panel');
            }
        },
    },
    beforeUnmount() {
        window.removeEventListener('click', this.handleClickOutside);
        window.removeEventListener('message', this.handleMessage);
    },
}

</script>

<style scoped>
.panel {
    display: relative;
    margin: 0;
    padding: 0;
    background-color: transparent;
}
</style>