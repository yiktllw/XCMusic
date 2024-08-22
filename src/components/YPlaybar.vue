<template>
    <div class="playbar">
        <div class="align-left">
            a
        </div>
        <div class="align-center">
            <div class="buttons">
                <button class="button like-button" @click="toogleLike">
                    <img class="img-like" src="../assets/likes.svg">
                </button>
                <button class="button previous-button" @click="previous" title="上一首">
                    <img class="img-previous" src="../assets/previous.svg">
                </button>
                <button class="button play-button" @click="tooglePlayState" :title="playState === 'pause' ? '播放' : '暂停'">
                    <img v-show="playState === 'pause'" class="img-play" src="../assets/play.svg">
                    <img v-show="playState === 'play'" class="img-pause" src="../assets/pause.svg">
                </button>
                <button class="button next-button" @click="next" title="下一首">
                    <img class="img-next" src="../assets/next.svg">
                </button>
                <button class="button playMode-button" @click="tooglePlayMode">
                    <img v-show="playMode === 'order'" class="img-order" src="../assets/order.svg" title="顺序播放">
                    <img v-show="playMode === 'random'" class="img-random" src="../assets/random.svg" title="随机播放">
                    <img v-show="playMode === 'loop'" class="img-loop" src="../assets/loop.svg" title="单曲循环">
                    <img v-show="playMode === 'listloop'" class="img-listloop" src="../assets/listloop.svg" title="列表循环">
                </button>
            </div>
            <div class="progress-bar">
                progress-bar
            </div>
        </div>
        <div class="align-right">
            a
        </div>
    </div>
</template>

<script lang="js">

export default {
    name: 'YPlaybar',
    data() {
        return {
            playState: 'play',
            playMode: 'order'
        }
    },
    methods: {
        toogleLike() {
            console.log('toogleLike');
        },
        previous() {
            console.log('previous');
        },
        tooglePlayState() {
            this.playState = this.playState === 'play' ? 'pause' : 'play';
            console.log('tooglePlayState');
        },
        next() {
            console.log('next');
        },
        tooglePlayMode() {
            switch (this.playMode) {
                case 'order':
                    this.playMode = 'random';
                    break;
                case 'random':
                    this.playMode = 'loop';
                    break;
                case 'loop':
                    this.playMode = 'listloop';
                    break;
                case 'listloop':
                    this.playMode = 'order';
                    break;
            }
            console.log('tooglePlayMode',this.playMode);
        }
    }
}

</script>

<style scoped>
.playbar {
    display: flex;
    color: white;
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0;
}

.align-left {
    display: flex;
    align-items: center;
    height: 100%;
}

.align-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    margin-top: 15px;
}

.buttons {
    display: flex;
    align-items: center;
}

.button {
    margin: 0 10px;
    cursor: pointer;
    background-color: transparent;
    border: none;
}

.play-button {
    display: flex;
    width: 40px;
    height: 40px;
    background-color: rgb(254, 60, 90);
    align-items: center;
    justify-content: center;
    border-radius: 100%;
    overflow: hidden;
}

.img-like {
    width: 22px;
    height: 22px;
}

.img-previous {
    width: 18px;
    height: 18px;
}

.img-play {
    width: 16px;
    height: 16px;
    padding-left: 3px;
}

.img-pause {
    width: 16px;
    height: 16px;
}

.img-next {
    width: 18px;
    height: 18px;
}

.playMode-button {
    display: flex;
    width: 22px;
    height: 22px;
    align-items: center;
    justify-content: center;
    margin-bottom: 3px;
}

.img-order {
    width: 20px;
    height: 20px;
}

.img-random {
    width: 18px;
    height: 18px;
}

.img-loop {
    width: 22px;
    height: 22px;
}

.img-listloop {
    width: 22px;
    height: 22px;
}

.progress-bar {
    background-color: transparent;
}

.align-right {
    display: flex;
    align-items: center;
    height: 100%;
}
</style>