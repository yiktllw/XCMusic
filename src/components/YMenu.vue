<template>
  <div class="dropdown">
    <button class="dropdown-button" @click="toggleMenu">
      {{ selectedOption }}
    </button>
    <div class="dropdown-content" v-if="isMenuOpen">
      <ul>
        <li v-for="option in options" :key="option" @click="selectOption(option)">
          {{ option }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isMenuOpen: false,
      options: ['Option 1', 'Option 2', 'Option 3'], // 你可以根据需求修改
      selectedOption: 'Select an option',
    };
  },
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },
    selectOption(option) {
      this.selectedOption = option;
      this.isMenuOpen = false;
    },
  },
};
</script>

<style scoped>
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-button {
  background-color: #4CAF50;
  color: white;
  padding: 10px;
  font-size: 16px;
  border: none;
  cursor: pointer;
}

.dropdown-content {
  display: block;
  position: absolute;
  background-color: #f9f9f9;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;
}

.dropdown-content ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.dropdown-content li {
  padding: 12px 16px;
  cursor: pointer;
}

.dropdown-content li:hover {
  background-color: #f1f1f1;
}
</style>