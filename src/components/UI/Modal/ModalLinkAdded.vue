<script setup lang="ts">
import { inject } from "vue";
import MyButton from "../MyButton.vue";
import MyInput from "../MyInput.vue";
import { useInteractiveVisiable } from "../../../store/InteractiveVisiable";
import type { Edge } from "v-network-graph";
import useClearObject from "../../../hooks/useClearObject";

const interactiveVisiable = useInteractiveVisiable();
const { addObjectEdges } = inject("objectEdges");

const newLink: Edge = {
  target: "",
  source: "",
};
</script>

<template>
  <div
    class="dialog"
    v-if="interactiveVisiable.isVisiableModalLinkAdded"
    @click="interactiveVisiable.toggleIsVisiableModalLinkAdded()"
  >
    <div @click.stop class="dialog__content">
      <h1>Add Link</h1>
      <div class="divContent">
        <p>Source:</p>
        <MyInput
          v-focus
          type="text"
          placeholder="Node 1"
          v-model="newLink.source"
        />
      </div>
      <div class="divContent">
        <p>Target:</p>
        <MyInput type="text" placeholder="Node 2" v-model="newLink.target" />
      </div>

      <MyButton
        style="margin-left: auto"
        @click="
          interactiveVisiable.toggleIsVisiableModalLinkAdded();
          addObjectEdges(newLink);
          useClearObject(newLink);
        "
        >Add</MyButton
      >
    </div>
  </div>
</template>

<style scoped>
.divContent {
  display: flex;
  flex-direction: row;
  gap: 5px;
  justify-content: space-between;
  align-items: center;
}
.dialog {
  top: 0%;
  bottom: 0%;
  right: 0%;
  left: 0%;
  background: rgba(0, 0, 0, 0.5);
  position: fixed;
  display: flex;
  gap: 10px;
  z-index: 1;
}

.dialog__content {
  display: flex;
  flex-direction: column;
  margin: auto;
  background: white;
  border-radius: 12px;
  min-height: 100px;
  min-width: 500px;
  padding: 20px;
  gap: 10px;
}
</style>
