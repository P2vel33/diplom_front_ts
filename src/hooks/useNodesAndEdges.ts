import type { Edges, Nodes } from "v-network-graph";
import { ref, type Ref } from "vue";

export default function useNodesAndEdges(newjsonFromTextArea) {
  const objectNodes: Ref<Nodes> = ref({});
  const objectEdges: Ref<Edges> = ref({});
  const obj1: Ref<Nodes> = ref({});
  const obj2: Ref<Edges> = ref({});

  function processNodes(nodes, obj1) {
    for (let itemOfElement of Object.keys(nodes)) {
      const node = nodes[itemOfElement];
      obj1.value[itemOfElement] = {
        ...node,
        face:
          node.typeOfNetworkHardware === "Switch" ? "Comm.png" : "Router.png",
      };
    }
  }

  function processLinks(links, obj2) {
    for (let itemOfElement of Object.keys(links)) {
      links[itemOfElement].forEach((elementsOfJsonent) => {
        obj2.value[`${itemOfElement}-${elementsOfJsonent}`] = {
          source: `${itemOfElement}`,
          target: `node${elementsOfJsonent}`,
        };
      });
    }
  }

  function processJson(newjsonFromTextArea, obj1, obj2) {
    Object.keys(newjsonFromTextArea).forEach((elementsOfJson) => {
      if (elementsOfJson === "nodes") {
        processNodes(newjsonFromTextArea[elementsOfJson], obj1);
      } else if (elementsOfJson === "links") {
        processLinks(newjsonFromTextArea[elementsOfJson], obj2);
      }
    });
  }

  processJson(newjsonFromTextArea, obj1, obj2);

  objectNodes.value = obj1.value;
  objectEdges.value = obj2.value;

  return { objectNodes, objectEdges };
}
