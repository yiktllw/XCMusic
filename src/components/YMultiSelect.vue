<script setup>
let items = defineModel() 
</script>

<template>
    <div class="list">
        <div v-for="(item, index) in items" :key="item.key ?? index" class="item">
            <div class="multi-select-item ">
                <input type="checkbox" v-model="item.selected" />
            </div>
            <slot name="item" v-bind="{ item, index }" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.list {
    display: flex;
    flex-direction: column;
    .item {
        display: flex;
        flex-direction: row;
        align-items: center;
    }
}
</style>