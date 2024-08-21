<template>
    <div class="playbar">
        <div class="align-left">
            a
        </div>
        <div class="align-center">
            <div class="buttons">
                <button class="button like-button">
                    <img class="img-like" src="../assets/likes.svg">
                </button>
                <button class="button previous-button">
                    <img class="img-previous" src="../assets/previous.svg">
                </button>
                <button class="button play-button" @click="tooglePlayState">
                    <img v-show="playState === 'pause'" class="img-play" src="../assets/play.svg">
                    <img v-show="playState === 'play'" class="img-pause" src="../assets/pause.svg">
                </button>
                <button class="button next-button">
                    <img class="img-next" src="../assets/next.svg">
                </button>
                <button class="button playMode-button">
                    playMode
                </button>
            </div>
            <div class="progress-bar">

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
        }
    },
    methods: {
        tooglePlayState() {
            this.playState = this.playState === 'play' ? 'pause' : 'play';
            console.log('tooglePlayState');
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
    align-items: center;
    height: 100%;
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
.progress-bar {
    background-color: white;
}

.align-right {
    display: flex;
    align-items: center;
    height: 100%;
}
</style>