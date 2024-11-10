<template>
    <YPanel :slide-direction="0" :default-show="false" :animation-time="0.1" :hideMode="'show'" ref="panel">
        <div id="panel">
            <div class="container" id="contextMenu-main"
                v-bind:style="{ '--transform': _transform, '--top': posY, '--left': posX }" ref="container">
                <div class="item font-color-main" v-for="item in items" :key="item.label"
                    @click="handleClick(item.role)">
                    <div class="item-content" v-if="item.display">
                        <img class="item-icon g-icon" :src="item.icon" v-if="item.icon" />
                        <div class="item-label">
                            {{ item.label.includes('查看评论') || item.label.includes('View Comment') ? item.label :
                                $t(item.label) }}
                        </div>
                    </div>
                    <div class="separator" v-if="item.showSeparator" />
                </div>
            </div>
        </div>
    </YPanel>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { YContextMenuItemC } from '../dual/YContextMenuItemC'
import YPanel from './YPanel.vue';

export default defineComponent({
    name: 'YContextMenu',
    setup() {
        const panel = ref<InstanceType<typeof YPanel> | null>();
        return {
            panel
        }
    },
    beforeUnmount() {
        this.panel = null;
    },
    props: {
        items: {
            type: Array<YContextMenuItemC>,
            required: true,
            validator: function (value: YContextMenuItemC[]) {
                return value.every(item => item instanceof YContextMenuItemC)
            }
        },
        // 以鼠标位置为原点，控制在哪个象限显示
        direction: {
            type: Number,
            default: 4,
            validator: function (value) {
                return value === 1 || value === 2 || value === 3 || value === 4;
            }
        },
        target: {
            default: null
        },
        posX: {
            type: String,
            default: '0px',
        },
        posY: {
            type: String,
            default: '0px',
        }
    },
    components: {
        YPanel
    },
    emits: [
        'menu-click'
    ],
    computed: {
        _transform() {
            const directions = [
                'translateY(-100%)',
                'translate3D(-100% , -100% , 0)',
                'translateX(-100%)',
                '',
            ];
            return directions[this.direction - 1];
        },
    },
    methods: {
        handleClick(role: string) {
            this.$emit('menu-click', {
                role: role,
                target: this.target,
                from: -1,
            })
            this.panel?.tooglePanel();
        },
        showContextMenu() {
            this.panel?._showPanel();
        },
        closeContextMenu() {
            this.panel?.closePanel();
        },
        toogleContextMenu() {
            this.panel?.tooglePanel();
        },
    }
})
</script>

<style lang="scss" scoped>
.container {
    position: fixed;
    display: flex;
    flex-direction: column;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.4);
    border-radius: 5px;
    background-color: var(--panel-background-color);
    width: calc(321px - 123px);
    overflow: hidden;
    transform: var(--transform);
    top: var(--top);
    left: var(--left);
    z-index: 100;

    .item {
        display: flex;
        flex-direction: column;
        align-items: center;

        &:hover {
            background-color: rgba(var(--foreground-color-rgb), 0.1);
        }

        .item-content {
            display: flex;
            width: calc(100% - 20px);
            align-items: center;
            flex-direction: row;
            cursor: pointer;
            height: 25px;
            padding: 5px 10px;
            opacity: .8;

            .item-icon {
                width: 16px;
                height: 16px;
                margin-right: 7px;
            }
        }

        .separator {
            width: calc(100% - 20px);
            height: 1px;
            background-color: rgba(var(--foreground-color-rgb), 0.1);
        }
    }
}
</style>