import SortableTree from 'sortable-tree';
import type {
    SortableTreeNodeData,
    SortableTreeOnChangeFunction
} from 'sortable-tree';

declare global {
    interface Window {
        commitChanges: (event: Event, type: string, index: number) => void;
    }
}

interface Feature {
    id: number;
    name: string;
    description: string;
    tags: FeatureTags[];
    scenarios: Scenario[];
}

interface ThingPosition {
    type: string;
    position: number;
    id: number;
}

interface ThingPositionList {
    thingPositions: ThingPosition[];
    moveThingFromTo(thingId: number, fromPosition: number, toPosition: number): void;
    map<T>(callbackfn: (value: ThingPosition, index: number, array: ThingPosition[]) => T, thisArg?: any): T[];
}

class ThingPositionList {
    constructor(public thingPositions: ThingPosition[] = []) { }
    moveThingFromTo(thingId: number, toPosition: number) {
        const thingIndex = this.thingPositions.findIndex(thing => thing.id === thingId);
        const thing = this.thingPositions[thingIndex];
        this.thingPositions.splice(thingIndex, 1);
        this.thingPositions.splice(toPosition, 0, thing);
    }
    map<T>(callbackfn: (value: ThingPosition, index: number, array: ThingPosition[]) => T, thisArg?: any): T[] {
        return this.thingPositions.map(callbackfn, thisArg);
    }
}

interface FeatureGroup {
    id: number;
    name: string;
    superGroupIDs: number[];
    subGroupIDs: number[];
    thingPositions: ThingPositionList;

    // referencedFeatureIDs: number[];
    // referencedFeatureGroupIDs: number[];
}

class FeatureGroup {
    constructor(
        public id: number,
        public name: string,
        public superGroupIDs: number[] = [],
        public subGroupIDs: number[] = [],
        public thingPositions: ThingPositionList = new ThingPositionList()
    ) {
        this.id = id;
        this.name = name;
        this.superGroupIDs = superGroupIDs;
        this.subGroupIDs = subGroupIDs;
        this.thingPositions = thingPositions;
    }
}

interface Scenario {
    id: ScenarioId;
    name: ScenarioName;
    description: ScenarioDescription;
    tags: ScenarioTags[];
    steps: Step[];
}

interface Step {
    id: number;
    type: StepType;
    value: string;
}

class Step {
    constructor(public id: number, public type: StepType, public value: string) { }
}

enum StepType {
    Given,
    When,
    Then,

    Comment,
    Examples,
    ScenarioOutline,
}

interface Tag {
    id: number;
    name: string;
}

type FeatureTags = Tag[];
type ScenarioTags = Tag[];
type ScenarioDescription = string;
type ScenarioName = string;
type ScenarioId = number;
type FeatureOrGroup = Feature | FeatureGroup;
const dataMap = new Map<number, FeatureOrGroup>();
// type FeatureReferenceTreeNode = {
//     id: number;
//     items: FeatureReferenceTreeNode[];
// }

// const featuresToTreeNodes : FeatureReferenceTreeNode[] = (features: FeatureOrGroup[]) => features.map(feature => ({
//     //data: { ...feature }, // your feature data
//     id: feature.id,
//     items: feature.items ? featuresToTreeNodes(feature.items) : [] // recursive call for nested items
// }));

// interface SortableTreeNodeData {
//     id: number;
//     name: string;
//     children?: SortableTreeNodeData[];
//     nodes?: SortableTreeNodeData[];
// }

function convertToSortableTreeData(groups: FeatureGroup[]): SortableTreeNodeData[] {
    return groups.map(group => ({
        id: group.id,
        name: group.name,
        data: group,
        nodes: group.thingPositions.map((pos: ThingPosition) => {
            // For this example, let's assume every child is another group.
            // In a real scenario, you would fetch the actual Feature or FeatureGroup from somewhere
            // based on the id in pos.
            const childGroup = treeData.find(g => g.id === pos.id); // Replace with actual data fetching logic
            return childGroup ? {
                id: childGroup.id,
                name: childGroup.name,
                children: convertToSortableTreeData(childGroup.thingPositions.map(p => treeData.find(g => g.id === p.id) as FeatureGroup))
            } : null;
        }).filter(child => child !== null) as SortableTreeNodeData[]
    }));
}

interface TreeNode {
    id: number;
    children?: TreeNode[];
}

// function toTreeNodes(featureGroup: FeatureGroup): TreeNode {
//     return {
//         id: featureGroup.id,
//         children: featuresToTreeNodes(featureGroup.items)
//     };
// }

export function setupFeatureBrowser(element: HTMLDivElement) {
    // const features: Feature[] = [
    //     {
    //         id: 1,
    //         name: "Feature 1",
    //         description: "This is the description for feature 1",
    //         tags: [],
    //         scenarios: [
    //             {
    //                 id: 1,
    //                 name: "Scenario 1",
    //                 description: "This is the description for scenario 1",
    //                 tags: [],
    //                 steps: [
    //                     {
    //                         id: 1,
    //                         type: StepType.Given,
    //                         description: "Given I am a user"
    //                     },
    //                     {
    //                         id: 2,
    //                         type: StepType.When,
    //                         description: "When I do something"
    //                     },
    //                     {
    //                         id: 3,
    //                         type: StepType.Then,
    //                         description: "Then something happens"
    //                     }
    //                 ]
    //             }
    //         ]
    //     },
    //     {
    //         id: 2,
    //         name: "Feature 2",
    //         description: "This is the description for feature 2",
    //         tags: [],
    //         scenarios: [
    //             {
    //                 id: 2,
    //                 name: "Scenario 2",
    //                 description: "This is the description for scenario 2",
    //                 tags: [],
    //                 steps: [
    //                     {
    //                         id: 4,
    //                         type: StepType.Given,
    //                         description: "Given I am a user"
    //                     },
    //                     {
    //                         id: 5,
    //                         type: StepType.When,
    //                         description: "When I do something"
    //                     },
    //                     {
    //                         id: 6,
    //                         type: StepType.Then,
    //                         description: "Then something happens"
    //                     }
    //                 ]
    //             }
    //         ]
    //     },
    // ];

    const dataMap = new Map<number, Feature | FeatureGroup>();
    dataMap.set(1, {
        id: 1,
        name: "Feature 1",
        description: "This is the description for feature 1",
        tags: [],
        scenarios: []
    });
    dataMap.set(2, {
        id: 2,
        name: "Feature Group",
        superGroupIDs: [],
        subGroupIDs: [],
        thingPositions: new ThingPositionList()
    });


    // define SortableTreeOnChangeFunction
    const onChange: SortableTreeOnChangeFunction = async (treeData) => {
        console.warn('onChange', treeData);
    }


    // Example data
    const rootGroups: FeatureGroup[] = [];

    const rootNodes = rootGroups; //.map(id => toTreeNodes(dataMap.get(id)));

    new SortableTree({
        nodes: convertToSortableTreeData(rootNodes),
        element: document.getElementById('your-tree-element-id') ?? document.createElement('div'),
        onChange
    });

    window.commitChanges = (event: Event, type: string, index: number) => {
        const target = event.target as HTMLElement;
        // if (type === 'feature') {
        //     features[index].name = target.innerText;
        // } else if (type === 'featureGroup') {
        //     features[index].name = target.innerText;
        // }
        console.warn("Commit Changes", {
            event,
            type,
            index,
            text: target.innerText
        })
    }

    function reRender() {
        let html = '';
        html += '<div id="featureContainer">';
        // features.forEach((feature, index) => {
        //     html += `<div class="draggable" draggable="true" ondragstart="drag(event)" id="feature${index}" contenteditable="true" onblur="commitChanges(event, 'feature', ${index})">${feature.name}</div>`;
        // });
        html += '</div>';
        html += '<button id="addScenario">Add Scenario</button><br>';
        html += '<button id="addFeature">Add Feature</button><br>';
        html += '<button id="addFeatureGroup">Add Feature Group</button>';
        element.innerHTML = html;
    }
    reRender();

    element.addEventListener('click', (event) => {
        if (event.target && (event.target as HTMLElement).id === 'addFeatureGroup') {
            // featureGroups.push({
            //     id: Date.now(),
            //     name: "New Feature Group",
            //     /** root features in this level of the data structure */
            //     features: [],
            //     /** directly-referenced "child-ish" feature group ids */
            //     subGroups: [],
            //     /** directly-referenced "parent-ish" feature group id */
            //     superGroup: null
            // })
            reRender();
        }
        if (event.target && (event.target as HTMLElement).id === 'addFeature') {
            // features.push({
            //     id: Date.now(),
            //     name: "New Feature",
            //     description: "",
            //     tags: [],
            //     scenarios: []
            // });
            reRender();
        }
        if (event.target && (event.target as HTMLElement).id === 'addScenario') {
            // features.push({
            //     id: Date.now(),
            //     name: "New Scenario",
            //     description: "",
            //     tags: [],
            //     steps: []
            // });
            reRender();
        }
        // Handle feature selection and display Scenario titles and descriptions
    });

    // UI elements for adding, renaming, editing, deleting features
    // UI elements for adding scenarios, re-ordering them
    // UI elements for grouping features into feature groups
    // UI elements for drag / drop feature/feature groups to re-nest or un-nest them
    // UI elements for adding Given, When, and Then type steps to the Scenario

    // Scenarios also have a name, description, and "tags" tokenized input field
    // The GWT step fields are also fuzzy-search ahead and search all valid commands throughout the system using a typeahead suggestion api
}