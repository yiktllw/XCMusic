<template>
    <div>
        <YArtistList :artists="users" type="user" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useStore } from 'vuex';
import { useApi } from '@/utils/api';
import YArtistList from '@/components/YArtistList.vue';

export default defineComponent({
    name: 'YFollowView',
    props: {
        uid: {
            type: Number,
            required: true,
        },
        type: {
            type: String,
            default: 'follows', // follows: 关注, followers: 粉丝
        },
    },
    components: {
        YArtistList,
    },
    watch: {
        uid() {
            this.fetchData();
        },
        type() {
            this.fetchData();
        },
    },
    setup() {
        const store = useStore();

        return {
            login: store.state.login,
        };
    },
    data() {
        return {
            users: [] as any[],
        };
    },
    methods: {
        async fetchData() {
            if (!this.uid) return;
            const path = '/user/' + (this.type === 'follows' ? 'follows' : 'followeds');
            await useApi(path, {
                uid: this.uid,
                cookie: this.login.cookie,
            }).then(res => {
                if (!res) return;
                if (this.type === 'follows') {
                    this.users = res.follow?.map((item: any) => {
                        return {
                            ...item,
                            _picUrl: item.avatarUrl + '?param=130y130',
                        };
                    }) ?? [];
                } else {
                    this.users = res.followeds?.map((item: any) => {
                        return {
                            ...item,
                            _picUrl: item.avatarUrl + '?param=130y130',
                        };
                    }) ?? [];
                }
                console.log(this.users);
            })
        },
    },
    mounted() {
        this.fetchData();
    },
});

</script>