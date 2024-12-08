<template>
  <!-- 关注、粉丝界面 -->
  <div>
    <YArtistList :artists="users" type="user" />
    <YPage v-model="page" />
  </div>
</template>

<script src="./YFollowView.ts" lang="ts"></script>
