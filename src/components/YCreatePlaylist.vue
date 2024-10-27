<template>
    <div>
        <YWindow ref="window" @new-window-state="handleNewWindowState">
            <template #header>
                <span style="font-size: 19px; font-weight: bold;">
                    {{ $t('create_playlist.title') }}
                </span>
            </template>
            <div class="main">
                <textarea class="input" v-model="inputValue" @input="handleInput" :maxlength="40"
                    :placeholder="$t('create_playlist.input_playlist_name')" rows="3"></textarea>
                <div class="check">
                    <input type="checkbox" v-model="isPrivate" />
                    <label @click="switchPrivate">
                        {{ $t('create_playlist.private') }}
                    </label>
                </div>
                <button class="create" @click="createPlaylist">
                    {{ $t('create_playlist.create') }}
                </button>
            </div>
        </YWindow>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import YWindow from './YWindow.vue';
import { useApi } from '@/utils/api';
import { Message } from '@/dual/YMessageC';
import { useStore } from 'vuex';

export default defineComponent({
    name: 'YCreatePlaylist',
    components: {
        YWindow,
    },
    setup() {
        const window = ref<InstanceType<typeof YWindow>>();
        const store = useStore();

        return {
            window,
            login: store.state.login,
        };
    },
    data() {
        return {
            inputValue: '',
            isPrivate: false,
        };
    },
    emits: [
        'new-window-state'
    ],
    methods: {
        handleInput(e: Event) {
            // this.inputValue = (e.target as HTMLInputElement).value;
        },
        switchPrivate() {
            this.isPrivate = !this.isPrivate;
        },
        handleNewWindowState(val: boolean) {
            this.$emit('new-window-state', val);
        },
        async createPlaylist() {
            if (this.inputValue.length === 0) {
                Message.post('error', this.$t('create_playlist.no_name'));
                return;
            }
            await useApi('/playlist/create', {
                name: this.inputValue,
                ...(this.isPrivate ? { privacy: 10 } : {}),
                cookie: this.login.cookie,
                timestamp: new Date().getTime(),
            }).then((res) => {
                console.log(res);
                this.login.refreshUserPlaylists();
            }).catch((err) => {
                console.error(err);
                Message.post('error', this.$t('create_playlist.error'));
            });
        },
    },
});
</script>

<style lang="scss" scoped>
.main {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 20px 10px 10px 10px;
    width: 321px;

    .input {
        padding: 5px 10px;
        font-size: 18px;
        resize: none;
        width: calc(100% - 20px);
    }

    .check {
        display: flex;
        align-items: center;
        width: 100%;
        // gap: 5px;

        input {
            cursor: pointer;
        }

        label {
            font-size: 16px;
            cursor: pointer;
            color: var(--font-color-high);
        }
    }

    .create {
        width: fit-content;
        font-size: 18px;
        border-radius: 20px;
        padding: 5px 20px 8px 20px;
        background-color: rgb(255, 70, 90);
        color: #fff;
        border: none;
        cursor: pointer;
    }
}
</style>