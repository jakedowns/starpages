import SortableTree from 'sortable-tree';
import 'sortable-tree/dist/sortable-tree.css';
import type {
    SortableTreeNodeData,
    SortableTreeOnChangeFunction
} from 'sortable-tree';

declare global {
    interface Window {
        commitChanges: (event: Event, type: string, index: number) => void;
        displayStateAsExport: () => void;
        processJSONStateImport: () => void;
        doPrettyPrint: boolean;
        importing: boolean;
        reRender: () => void;
        toggleExportArea: () => void;
        toggleImportArea: () => void;
        togglePrettyPrint: () => void;

        theTree: SortableTree;
    }
}

window.reRender = () => {
    window.dispatchEvent(new Event('reRender'));
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
    public static fromSortableTreeNodeData(data: SortableTreeNodeData): FeatureGroup {
        // cast data.data to FeatureGroup
        if (!data.data) {
            throw new Error('Invalid input: data.data should be an object');
        }
        // if (!data.data.id) {
        //     throw new Error('Invalid input: data.data.id should be a number');
        // }
        // if (!data.data.name) {
        //     throw new Error('Invalid input: data.data.name should be a string');
        // }
        // if (!data.data.superGroupIDs) {
        //     throw new Error('Invalid input: data.data.superGroupIDs should be an array');
        // }
        // if (!data.data.subGroupIDs) {
        //     throw new Error('Invalid input: data.data.subGroupIDs should be an array');
        // }
        // if (!data.data.thingPositions) {
        //     throw new Error('Invalid input: data.data.thingPositions should be an array');
        // }
        let _temp : FeatureGroup = data.data as unknown as FeatureGroup;
        // console.warn('TODO: see if we have _more_ info in the dataMap cache...',{
        //     cacheHitOrMiss: dataMap.has(_temp.id),
        //     cacheValue: dataMap.get(_temp.id),
        // });

        // Retrieve the cached value, if it exists
        const cachedFeatureGroup = dataMap.get(_temp.id) as FeatureGroup | undefined;

        // Merge the cached data with the defaults from _temp
        return new FeatureGroup(
            _temp.id, 
            cachedFeatureGroup?.name ?? _temp.name, 
            cachedFeatureGroup?.superGroupIDs ?? _temp.superGroupIDs ?? [], 
            cachedFeatureGroup?.subGroupIDs ?? _temp.subGroupIDs ?? [], 
            cachedFeatureGroup?.thingPositions ?? _temp.thingPositions ?? new ThingPositionList()
        );
    }
}

/** 
 * Here's the code related to importing and exporting features
 * for now, we're going to use a simple JSON format for import/export
*/

function displayStateAsExport(){
    let text: string = JSON.stringify({dataMap, treeData}, null, window.doPrettyPrint?2:undefined);
    const element = document.getElementById('export');
    if(element){
        element.innerText = text;
    }
}
window.displayStateAsExport = displayStateAsExport;
function processJSONStateImport(){
    const element = document.getElementById('import');
    if(element){
        const text = element.innerText;
        try{
            const json = JSON.parse(text);
            if(json.dataMap && json.treeData){
                dataMap.clear();
                dataMap.set(...json.dataMap);
                treeData.splice(0, treeData.length, ...json.treeData);
                window.dispatchEvent(new Event('reRender'));
            }
        }catch(e){
            console.error(e);
        }
    }
}
window.processJSONStateImport = processJSONStateImport;

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

type FeatureDataMapType = Map<number, FeatureOrGroup>;

class FeatureDataMap extends Map<number, FeatureOrGroup> {
    constructor() {
        super();
    }
}
const dataMap: FeatureDataMapType = new FeatureDataMap();
// type FeatureReferenceTreeNode = {
//     id: number;
//     items: FeatureReferenceTreeNode[];
// }

// const featuresToTreeNodes : FeatureReferenceTreeNode[] = (features: FeatureOrGroup[]) => features.map(feature => ({
//     //data: { ...feature }, // your feature data
//     id: feature.id,
//     items: feature.items ? featuresToTreeNodes(feature.items) : [] // recursive call for nested items
// }));

const treeData: SortableTreeNodeData[] = [];
treeData.push({
    data:{
        // only a placeholder "id" link to our big, central, flat data cache
        id: 1,
        name: "user features",
    },
    nodes:[{
        data: {
            id: 2,
            name: "watched-lots.feature"
        },
        nodes:[]
    },{
        data: {
            id: 3,
            name: "user-account-registration.feature"
        },
        nodes:[]
    },{
        data: {
            id: 4,
            name: "kyc.feature"
        },
        nodes:[]
    },{
        data: {
            id: 5,
            name: 'mailing-list-preferences.feature'
        },
        nodes:[]
    }]
},{
    data: { id: 99, name: "day of sale"},
    nodes:[]
},{
    data: { id: 100, name: "admin features"},
    nodes:[
        {
            data: {id: 1001, name: "gherkin-test-manager.feature"},
            nodes: []
        },
        {
            data: {id: 1002, name: "reset-test-db.feature"},
            nodes: []
        },
    ]
},{
    data: { id: 100, name: "dev exp features"},
    nodes:[
        {
            data: {id: 1001, name: "ci-cd.feature"},
            nodes: []
        },
        {
            data: {id: 1002, name: ".feature"},
            nodes: []
        },
    ]
},{
    /* surfacing hidden functionality */
    data: { id: 101, name: "photo editor features"},
    nodes:[{
        data:{ id: 1011, name: "item-page-photo-editor-shortcuts.feature"},
        nodes:[]
    }]
},{
    data:{
        id: 6,
        name: "user sale features"
    },
    nodes:[
        {
            data: { id: 7, name: "user-sale-registration.feature"},
            nodes:[]
        },
        {
            data: { id: 77, name: "user-bidding.feature"},
            nodes: [],
        },
        {
            data: { id: 999, name: "user-sms-notification.feature"},
            nodes:[]
        },
        {
            data: { id: 8, name: "user-email-verification.feature"},
            nodes:[]
        },
        {
            data: { id: 9, name: "user-address-management.feature"},
            nodes:[]
        },
        {
            data: { id: 10, name: "user-watched-lots.feature"},
            nodes:[]
        },
        {
            data: { id: 11, name: "user-bid-history.feature"},
            nodes:[]
        }
    ]
});

// function convertToSortableTreeData(groups: FeatureGroup[], _dataMap: FeatureDataMapType) {
//     if (!Array.isArray(groups)) {
//         throw new Error('Invalid input: groups should be an array');
//     }

//     return groups.map(group => {
//         if (!group || !group.id || !group.name) {
//             console.warn('Warning: Invalid group encountered', group);
//             return null;
//         }

//         const nodes = group.thingPositions
//             .map((pos: any) => {
//                 if (!pos || !pos.id) {
//                     console.warn('Warning: Invalid position encountered', pos);
//                     return null;
//                 }

//                 const childGroup = _dataMap.get(pos.id);
//                 if (!childGroup) {
//                     console.warn(`Warning: No child group found for id ${pos.id}`);
//                     return null;
//                 }

//                 return {
//                     id: childGroup.id,
//                     name: childGroup.name,
//                     children: convertToSortableTreeData(childGroup.thingPositions, _dataMap)
//                 };
//             })
//             .filter((node: any) => node !== null);

//         return { id: group.id, name: group.name, nodes };
//     }).filter(group => group !== null);
// }

// Usage
// const treeDataMap = new Map(treeData.map(group => [group.id, group]));
// const sortableTreeData = convertToSortableTreeData(featureGroups, treeDataMap);

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

    let tree:SortableTree = new SortableTree({
        nodes: treeData, //convertToSortableTreeData(rootNodes, dataMap),
        element: document.getElementById('your-tree-element-id') ?? document.createElement('div'),
        onChange,

        initCollapseLevel: 4,
        lockRootLevel: false,
        styles: {
            // tree: 'my-tree',
            // node: 'my-tree__node',
            // label: 'my-tree__label',
            // subnodes: 'my-tree__subnodes',
            // collapse: 'my-tree__collapse',
        },

        stateId: 'tree-basic',

        renderLabel: (props) => {
            return props.id + ' ' + props.name
        }
        
    });
    window.theTree = tree;

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

    console.warn('what?',window.toggleExportArea)

    window.toggleExportArea = function(){
        showExportingArea=!showExportingArea;
        const element = document.getElementById('export');
        if(element){
            element.classList.toggle('hidden', !showExportingArea)
        }
        window.reRender();
    }
    

    function getNestedHtml(featureGroup: SortableTreeNodeData) {
        const group:FeatureGroup = FeatureGroup.fromSortableTreeNodeData(featureGroup);
        if(!featureGroup){
            return '';
        }
        let output = '';
        if(typeof featureGroup.nodes !== 'undefined'){
            if(featureGroup.nodes.length === 0){
                return '';
            }
            // if it's not an array ...
            if(!Array.isArray(featureGroup.nodes)){
                return '';
            }
            featureGroup.nodes.forEach((entry, index) => {
                output += getNestedHtml(entry);
            });
        }else{
            if(featureGroup.data.id){
                output += `${featureGroup.data.id} ${featureGroup.data.name}}`
            }else{
                output += `bad fG data`
            }
        }
        return output;
    }

    

    let doPrettyPrint = false;
    let importing = false;
    let showExportingArea = false;
    window.doPrettyPrint = doPrettyPrint;
    window.importing = importing;
    function toggleImportArea(){
        importing=!importing;
        if(importing){window.processJSONStateImport();}
        window.reRender();
        console.log(importing)
    }
    window.toggleImportArea = toggleImportArea;
    function togglePrettyPrint(){
        doPrettyPrint=!doPrettyPrint;
        window.reRender();
    }
    window.togglePrettyPrint = togglePrettyPrint;


/**
 

<label for="prettyPrint">Pretty Print&nbsp;
        <input type="checkbox" id="prettyPrint" onclick="togglePrettyPrint()" ${doPrettyPrint?'checked="checked"':''} />
        </label>

 <div class="importExport">
    <button onclick="toggleImportArea()">Import</button>
    <div class="import">
        <textarea id="import" class="${importing?'':'hidden'}"  placeholder="Paste JSON here to import"></textarea>
    </div>
    <button onclick="toggleExportArea()">Export</button>
    <div class="export">
        <textarea id="export" class="${showExportingArea?'':'hidden'}" placeholder="JSON export will appear here"></textarea>
    </div>
</div>
 */

    function _reRender() {
        let html = '';
        html += '<div id="featureContainer">';
        html += `
number of root nodes: ${treeData[0].nodes.length}<br/>
number of first level nodes: ${treeData[0].nodes.reduce((total,next)=>{
    return total+next.nodes.length;
},0)}<br/>
number of dataMap entries: ${dataMap.size}
`;
        treeData[0].nodes.forEach((entry, index) => {
            html += getNestedHtml(entry)
        });
        html += '</div>';
        html += '<button id="addScenario">Add Scenario</button><br>';
        html += '<button id="addFeature">Add Feature</button><br>';
        html += '<button id="addFeatureGroup">Add Feature Group</button>';
        element.innerHTML = html;

        displayStateAsExport();
    }
    _reRender();
    // window.addEventListener('reRender',_reRender);
    // window.dispatchEvent(new Event('reRender'));

    element.addEventListener('click', (event) => {
        if (event.target && (event.target as HTMLElement).id === 'addFeatureGroup') {
            let _new_thing_temp_id = performance.now(); // event timestamp?
            dataMap.set(_new_thing_temp_id, {
                id: _new_thing_temp_id,
                name: "New Feature Group",
                superGroupIDs: [],
                subGroupIDs: [],
                thingPositions: new ThingPositionList()
            });
            treeData[0].nodes.push({
                data:{
                    id: _new_thing_temp_id,
                    name: "New Feature Group", 
                    // we mirror cached name so we don't 
                    // have to do lookup in big data cache during high-speed operations

                    // need to look into performance trade-offs of this approach vs
                    // slinging copies of the data around
                },
                nodes:[{
                    data:{},
                    nodes:[]
                }]
            });

            // update SortableTree
            //window.theTree.

            _reRender();
        }
        if (event.target && (event.target as HTMLElement).id === 'addFeature') {
            // features.push({
            //     id: Date.now(),
            //     name: "New Feature",
            //     description: "",
            //     tags: [],
            //     scenarios: []
            // });
            _reRender();
        }
        if (event.target && (event.target as HTMLElement).id === 'addScenario') {
            // features.push({
            //     id: Date.now(),
            //     name: "New Scenario",
            //     description: "",
            //     tags: [],
            //     steps: []
            // });
            _reRender();
        }
        // Handle feature selection and display Scenario titles and descriptions
    })
}
