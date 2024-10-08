<script setup lang="js">
let page = defineModel(); // eslint-disable-line
</script>

<template>
    <div class="page-main font-color-main" v-if="page.total > 1">
        <div class="previous" @click="page.previous">
            <img src="@/assets/backarrow.svg" class="arrow-img g-icon">
        </div>
        <div class="all" v-if="page.total < 8">
            <div class="pages" v-for="i in page.total" :key="i" @click="page.current = i"
                :class="page.current === i ? 'currentPage' : ''">
                {{ i }}
            </div>
        </div>
        <div class="omit" v-else>
            <div class="pages" v-for="i in page.leftPage" :key="i" @click="page.current = i"
                :class="page.current === i ? 'currentPage' : ''">
                {{ i }}
            </div>
            <div class="pages">
                ...
            </div>
            <div class="pages" v-for="i in page.middlePage" :key="i" @click="page.current = i"
                :class="page.current === i ? 'currentPage' : ''">
                {{ i }}
            </div>
            <div class="pages" v-if="page.current > 2 && page.current < page.total - 1">
                ...
            </div>
            <div class="pages" v-for="i in page.rightPage" :key="i" @click="page.current = i"
                :class="page.current === i ? 'currentPage' : ''">
                {{ i }}
            </div>
        </div>
        <div class="next" @click="page.next">
            <img src="@/assets/forwardarrow.svg" class="arrow-img g-icon">
        </div>
    </div>
</template>

<script lang="js">
export default {
    name: 'YPage',
    data() {
        return {

        };
    },
    methods: {
    },
}

</script>

<style lang="scss" scoped>
.page-main {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    width: 100%;
    font-weight: bold;
    background-color: transparent;

    .previous,
    .next {
        display: flex;
        cursor: pointer;
        padding: 5px;
        margin: 5px;
        width: 20px;
        height: 20px;
        border-radius: 10px;
        align-items: center;
        justify-content: center;
    }

    .all {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
    }

    .omit {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
    }

    .pages {
        cursor: pointer;
        padding: 5px;
        margin: 5px;
        width: 20px;
        height: 20px;
        /* border: 1px solid #fff; */
        border-radius: 10px;
    }

    .currentPage {
        /* background-color: #fff; */
        color: rgb(200, 136, 166);
    }

    .arrow-img {
        width: 14px;
        height: 14px;
    }
}
</style>