<template>
    <div class="main">
        <div class="sheet-titlebar font-color-high">
            <div class="left">
                <span class="sheet-titlebar-item">
                    {{ $t('sheet_view.current_page_left') + page.current + $t('sheet_view.current_page_right') }}
                </span>
            </div>
            <div class="center">
                <span class="prev sheet-titlebar-item">{{ $t('sheet_view.prev_page') }} H</span>
                <span class="scroll-item sheet-titlebar-item">{{ $t('sheet_view.scroll') }} J&nbsp;/&nbsp;K</span>
                <span class="next sheet-titlebar-item">{{ $t('sheet_view.next_page') }} L</span>
            </div>
            <div class="right">
                <span class="sheet-titlebar-item">
                    {{ $t('sheet_view.total_page_left') + page.total + $t('sheet_view.total_page_right') }}
                </span>
            </div>
        </div>
        <div class="sheet-item" v-if="sheet.length > 0">
            <img :src="sheet[page.current - 1].url" class="sheet-img" />
        </div>
        <div class="no-sheet font-color-high " v-else>
            暂无权限查看
        </div>
        <YPage v-model="page" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useStore } from 'vuex';
import { useApi } from '@/utils/api';
import YPage from '@/components/YPage.vue';
import { YPageC } from '@/dual/YPageC';

export default defineComponent({
    name: 'YSheetView',
    props: {
        sheetId: {
            required: true,
            type: Number,
        }
    },
    components: {
        YPage,
    },
    data() {
        return {
            sheet: [] as any[],
            page: new YPageC(1),
            scrollInterval: null as any,
        };
    },
    setup() {
        const store = useStore();
        return {
            login: store.state.login,
        };
    },
    watch: {
        sheetId() {
            this.getSheet();
        }
    },
    methods: {
        async getSheet() {
            await useApi('/sheet/preview', {
                id: this.sheetId,
                cookie: this.login.cookie,
            }).then((res: any) => {
                this.sheet = res.data;
                this.sheet = this.sheet.sort((a: any, b: any) => a.id - b.id);
                this.page = new YPageC(this.sheet.length > 0 ? this.sheet.length : 1);
            })
        },
        handleKeydown(e: KeyboardEvent) {
            if (this.scrollInterval) return;

            switch (e.key) {
                case 'h':
                case 'H':
                    this.page.previous();
                    break;
                case 'l':
                case 'L':
                    this.page.next();
                    break;
                case 'j':
                case 'J':
                    this.startScrolling('DOWN');
                    break;
                case 'k':
                case 'K':
                    this.startScrolling('UP');
                    break;
            }
        },
        handleKeyup(e: KeyboardEvent) {
            switch (e.key) {
                case 'j':
                case 'J':
                case 'k':
                case 'K':
                    this.stopScrolling();
                    break;
            }
        },
        startScrolling(direction: 'UP' | 'DOWN') {
            this.scroll(direction); 
            this.scrollInterval = window.setInterval(() => {
                this.scroll(direction); 
            }, 1000 / 60); 
        },
        stopScrolling() {
            if (this.scrollInterval) {
                clearInterval(this.scrollInterval);
                this.scrollInterval = null;
            }
        },
        scroll(direction: 'UP' | 'DOWN') {
            const scrollDom = document.getElementById('yscroll-display-area');
            scrollDom?.scrollBy({
                top: direction === 'UP' ? -14 : 14,
                behavior: 'auto',
            });
        }
    },
    mounted() {
        this.getSheet();
        window.addEventListener('keydown', this.handleKeydown);
        window.addEventListener('keyup', this.handleKeyup);
    },
    beforeUnmount() {
        window.removeEventListener('keydown', this.handleKeydown);
        window.removeEventListener('keyup', this.handleKeyup);
        this.stopScrolling(); 
    }
});

</script>

<style lang="scss" scoped>
.main {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    align-items: start;
    padding: 10px;
    align-items: first baseline;
    height: calc(100% - 50px);

    .sheet-titlebar {
        display: flex;
        margin-bottom: 10px;
        flex-direction: row;
        justify-content: space-between;
        width: 90%;

        .center {
            display: flex;
            flex-direction: row;
        }

        .sheet-titlebar-item {
            font-size: 18px;
            margin: 0 13px;
            font-weight: bold;
        }
    }

    .sheet-item {
        margin: 10px;

        .sheet-img {
            width: 90%;
        }
    }

    .no-sheet {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        font-size: 24px;
        font-weight: bold;
    }
}
</style>