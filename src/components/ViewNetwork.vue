<script setup lang="ts">
import * as vNG from "v-network-graph";
import {
  ForceLayout,
  ForceNodeDatum,
  ForceEdgeDatum,
} from "v-network-graph/lib/force-layout";
import { useNodeStore } from "../store/NodeStore";
import type { Nodes, Edges, Position, Node } from "v-network-graph";
import { computed, ref, watch, type Ref } from "vue";
import ModalNode from "./UI/ModalNode.vue";
import useYamlToJson from "../hooks/useYamlToJson";
import useNodesAndEdges from "../hooks/useNodesAndEdges";

const { textFromTextArea } = defineProps({
  textFromTextArea: {
    type: String,
    required: true,
  },
});

const jsonFromTextArea = computed(() => {
  return useYamlToJson(textFromTextArea).yamlTransfomToJson.value;
});

const nodeStore = useNodeStore();
const coordinateModal: Ref<Position> = ref({ x: 0, y: 0 });
const nodeModal: Ref<Node> = ref({});
const objectNodes: Ref<Nodes> = ref({});
const objectEdges: Ref<Edges> = ref({});

// const eventHandlers: vNG.EventHandlers =ref({}) ;
const configs = ref(vNG.defineConfigs({}));

let timer: number | null = null;
if (timer !== null) clearTimeout(timer);
timer = setTimeout(() => {}, 1000);

watch(jsonFromTextArea, (newjsonFromTextArea) => {
  if (timer !== null) clearTimeout(timer);
  timer = setTimeout(() => {
    objectEdges.value = useNodesAndEdges(newjsonFromTextArea).objectEdges.value;
    objectNodes.value = useNodesAndEdges(newjsonFromTextArea).objectNodes.value;
    configs.value = vNG.defineConfigs({
      view: {
        autoPanAndZoomOnLoad: "fit-content",
        layoutHandler: new ForceLayout({
          positionFixedByDrag: false,
          positionFixedByClickWithAltKey: false,

          noAutoRestartSimulation: true, // If the line is deleted or set to false,
          // d3-force recalculation will be performed when nodes are dragged or
          // the network changes.

          createSimulation: (d3, nodes, edges) => {
            const forceLink = d3
              .forceLink<ForceNodeDatum, ForceEdgeDatum>(edges)
              .id((d: ForceNodeDatum) => d.id);
            // Specify your own d3-force parameters
            return d3
              .forceSimulation(nodes)
              .force("edge", forceLink.distance(300).strength(1))
              .force("charge", d3.forceManyBody().strength(-2000))
              .force("x", d3.forceX())
              .force("y", d3.forceY())
              .stop() // tick manually
              .tick(100);
          },
        }),
        // layoutHandler: new vNG.GridLayout({ grid: 15 }),
      },
      node: {
        label: {
          visible: true,
        },
      },
    });
  }, 5000);
});

const eventHandlers: vNG.EventHandlers = {
  "node:pointerover": ({ node, event }): void => {
    const nodes: Object = objectNodes.value;
    coordinateModal.value = { x: event.clientX, y: event.clientY };
    nodeStore.isVisiable = true;
    nodeModal.value = nodes[node];
  },
  "node:pointerout": (): void => {
    nodeStore.isVisiable = false;
  },
};
</script>

<template>
  <ModalNode v-show="nodeStore.isVisiable" :coordinateModal :nodeModal />

  <v-network-graph
    :nodes="objectNodes"
    :edges="objectEdges"
    :configs="configs"
    :event-handlers="eventHandlers"
  >
    <defs>
      <!--
        Define the path for clipping the face image.
        To change the size of the applied node as it changes,
        add the `clipPathUnits="objectBoundingBox"` attribute
        and specify the relative size (0.0~1.0).
      -->
      <clipPath id="faceCircle" clipPathUnits="objectBoundingBox">
        <circle cx="0.5" cy="0.5" r="0.5" />
      </clipPath>
    </defs>

    <!-- Replace the node component -->
    <template #override-node="{ nodeId, scale, config, ...slotProps }">
      <!-- circle for filling background -->
      <circle
        class="face-circle"
        :r="config.radius * scale"
        fill="#ffffff"
        v-bind="slotProps"
      />
      <!--
        The base position of the <image /> is top left. The node's
        center should be (0,0), so slide it by specifying x and y.
      -->
      <image
        class="face-picture"
        :x="-config.radius * scale"
        :y="-config.radius * scale"
        :width="config.radius * scale * 2"
        :height="config.radius * scale * 2"
        :xlink:href="`/${objectNodes[nodeId].face}`"
        clip-path="url(#faceCircle)"
      />
      <!-- circle for drawing stroke -->
      <!-- <circle
        class="face-circle"
        :r="config.radius * scale"
        fill="none"
        stroke="#808080"
        :stroke-width="1 * scale"
        v-bind="slotProps"
      /> -->
    </template>
  </v-network-graph>
</template>

<style scoped>
/* // transitions when scaling on mouseover. */

.face-circle,
.face-picture {
  transition: all 0.1s linear;
  background: none;
}

/* // suppress image events so that mouse events are received */
/* // by the background circle. */
.face-picture {
  pointer-events: none;
}
</style>
