<script setup lang="ts">
import { debounce } from "lodash-es";
import * as vNG from "v-network-graph";
import {
  ForceLayout,
  type ForceNodeDatum,
  type ForceEdgeDatum,
} from "v-network-graph/lib/force-layout";
import { useNodeStore } from "../store/NodeStore";
import type { Nodes, Edges, Position, Node } from "v-network-graph";
import { provide, ref, watch, type Ref } from "vue";
import ModalNode from "./UI/Modal/ModalNode.vue";
import MyButton from "./UI/MyButton.vue";
import ModalNodeAdded from "./UI/Modal/ModalNodeAdded.vue";
import ModalLinkAdded from "./UI/Modal/ModalLinkAdded.vue";
import ModalLinkDeleted from "./UI/Modal/ModalLinkDeleted.vue";
import { useInteractiveVisiable } from "../store/InteractiveVisiable";
import ModalNodeDeleted from "./UI/Modal/ModalNodeDeleted.vue";
import View from "./View.vue";

const ACTIVE = "#00ee00";
const INACTIVE = "#ff0000";

const nodeStore = useNodeStore();
const interactiveVisiable = useInteractiveVisiable();
const coordinateModal: Ref<Position> = ref({ x: 0, y: 0 });
const nodeModal: Ref<Node> = ref({});
const objectNodes: Ref<Nodes> = ref({});
const objectEdges: Ref<Edges> = ref({});

const configs = ref(vNG.defineConfigs({}));

const eventHandlers: vNG.EventHandlers = {
  "node:pointerover": ({ node, event }): void => {
    const nodes: Nodes = objectNodes.value;
    coordinateModal.value = { x: event.clientX, y: event.clientY };
    nodeStore.isVisiable = true;
    nodeModal.value = nodes[node];
  },
  "node:pointermove": (): void => {
    nodeStore.isVisiable = false;
  },
  "node:pointerout": (): void => {
    nodeStore.isVisiable = false;
  },
  "node:click": ({ node }): void => {
    const nodes: Nodes = objectNodes.value;
    nodes[node].active = !nodes[node].active;
    console.log(nodes[node]);
    console.log(objectEdges.value);
  },
  "edge:click": ({ edge }): void => {
    const arr: string[] | undefined = edge?.split("-");
    arr?.forEach((elem) =>
      console.log(objectNodes.value[elem].external_ip_address)
    );
    console.log(objectEdges.value[edge]);
  },
};
const addObjectNodes = (object: Node) => {
  objectNodes.value[object.name] = {
    ...object,
    face: object.typeOfNetworkHardware === "Switch" ? "Comm.png" : "Router.png",
  };
};
const deleteObjectNodes = (object: Node) => {
  delete objectNodes.value[object.name];
};
interface Edge {
  target: string;
  source: string;
}
const addObjectEdges = (object: Edge) => {
  const { target, source } = object;
  objectEdges.value[`${source}-${target}`] = { target, source };
};
const deleteObjectEdges = (object: Edge) => {
  const { target, source } = object;
  delete objectEdges.value[`${source}-${target}`];
};

watch(
  objectEdges,
  () => {
    debounce(
      () => {
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
                  .force("edge", forceLink.distance(100).strength(1))
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
            selectable: true,
          },
          edge: {
            label: {},
            normal: {
              width: 2,
              color: "#888888",
              dasharray: (edge) =>
                objectNodes.value[edge.source].active &&
                objectNodes.value[edge.target].active
                  ? 4
                  : 0,
              animate: (edge) =>
                objectNodes.value[edge.source].active &&
                objectNodes.value[edge.target].active,
            },
            hover: {
              color: "#222222",
              // color: "#00ee7b",
            },
            margin: 2,
            marker: {
              source: {
                type: "circle",
                width: 5,
                height: 5,
                margin: 1,
                color: ([edge, _stroke]) =>
                  objectNodes.value[edge.source].active ? ACTIVE : INACTIVE,
              },
              target: {
                type: "circle",
                width: 5,
                height: 5,
                margin: 1,
                color: ([edge, _stroke]) =>
                  objectNodes.value[edge.target].active ? ACTIVE : INACTIVE,
              },
            },
          },
        });
      },
      { leading: false, maxWait: 3500, trailing: true }
    )();
  },
  { deep: true }
);
provide("objectNodes", { addObjectNodes, deleteObjectNodes });
provide("objectEdges", { addObjectEdges, deleteObjectEdges });
</script>

<template>
  <ModalNode v-show="nodeStore.isVisiable" :coordinateModal :nodeModal />
  <div class="btns">
    <MyButton
      @click="
        () => {
          interactiveVisiable.isVisiableModalNodeAdded = true;
          // nodeStore.count = Date.now();
        }
      "
      >Add Node</MyButton
    >
    <MyButton
      @click="
        () => {
          interactiveVisiable.isVisiableModalLinkAdded = true;
          // nodeStore.count = Date.now();
        }
      "
      >Add link</MyButton
    >
    <MyButton
      @click="
        () => {
          interactiveVisiable.isVisiableModalLinkDeleted = true;
          // nodeStore.count = Date.now();
        }
      "
      >Delete Link</MyButton
    >
    <MyButton
      @click="
        () => {
          interactiveVisiable.isVisiableModalNodeDeleted = true;
          // nodeStore.count = Date.now();
        }
      "
      >Delete Node</MyButton
    >
  </div>
  <ModalNodeAdded />
  <ModalLinkAdded />
  <ModalLinkDeleted />
  <ModalNodeDeleted />
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
.btns {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: end;
}
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
