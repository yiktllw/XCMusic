<template>
    <div>
        <YWindow ref="window" @new-window-state="handleNewWindowState">
            <template #header>
                <span style="font-size: 19px; font-weight: bold;">
                    {{ $t('titlebar.scanQRCodeToLogin') }}
                </span>
            </template>
            <img :src="base64Image" />
        </YWindow>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import YWindow from './YWindow.vue';

export default defineComponent({
    name: 'YLoginWindow',
    setup() {
        return {
        };
    },
    emits: [
        'new-window-state'
    ],
    props: {
        base64Image: {
            type: String,
            required: true,
        },
    },
    components: {
        YWindow,
    },
    data() {
        return {
        };
    },
    methods: {
        handleNewWindowState(val: boolean) {
            this.$emit('new-window-state', val);
        },
    },
});
</script>