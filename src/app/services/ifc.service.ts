import { Injectable } from '@angular/core';
import { IFCLoader } from 'web-ifc-three';
import { IFCModel } from 'web-ifc-three/IFC/components/IFCModel';
import * as THREE from 'three';
import * as WEBIFC from '../components/engine/categories.json';
import { IfcType, IfcCategory } from '../models/interfaces';

// IFC type IDs mapping (example; adjust based on WEBIFC content)
const ifcTypeIds: { [key: string]: number } = {
  'IFCWALL': 103,
  'IFCSLAB': 104,
  'IFCDOOR': 105,
  // Add more mappings as needed from WEBIFC or IFC schema
};

@Injectable({
  providedIn: 'root'
})
export class IfcService {
  private ifcLoader = new IFCLoader();
  private ifcModels: IFCModel[] = [];
  private ifc = this.ifcLoader.ifcManager;
  private types: IfcType[] = [];
  private filteredTypes: IfcType[] = [];
  private allIFCCategories: IfcCategory[] = [];
  private subsets: { [key: string]: any } = {};

  public preselectMat = new THREE.MeshLambertMaterial({
    transparent: true,
    opacity: 0.6,
    color: 0xff88ff,
    depthTest: false
  });

  public selectMat = new THREE.MeshLambertMaterial({
    transparent: true,
    opacity: 0.6,
    color: 0xff00ff,
    depthTest: false
  });

  async loadIfc(url: string, scene: THREE.Scene, onProgress: (progress: ProgressEvent) => void, onError: (error: Error) => void): Promise<IFCModel> {
    await this.ifc.setWasmPath('./assets/');
    return new Promise((resolve, reject) => {
      this.ifcLoader.load(url, (ifcModel: IFCModel) => {
        this.ifcModels.push(ifcModel);
        this.setupSpatialStructure(ifcModel, scene);
        resolve(ifcModel);
      }, onProgress, reject);
    });
  }

  private async setupSpatialStructure(ifcModel: IFCModel, scene: THREE.Scene) {
    const spatialStructure = await this.ifc.getSpatialStructure(ifcModel.modelID, false);
    if (spatialStructure.children.length > 0) {
      spatialStructure.checked = true;
      spatialStructure.level = 0;
      spatialStructure.levelIndex = 0;
      spatialStructure.parentID = 0;
      spatialStructure.parentExtracted = true;
      spatialStructure.selfExtracted = false;
      this.types.push(spatialStructure);
      this.filteredTypes.push(spatialStructure);
      await this.findAllChildrenTypes(spatialStructure.children, spatialStructure.expressID);
      await this.populateIFCCategories();
      await this.setupAllCategories(scene);
    }
  }

  private async findAllChildrenTypes(children: any[], parentId: number) {
    for (const child of children) {
      if (child.type) {
        const level = this.types.find(d => d.expressID === parentId)?.level + 1 || 0;
        child.checked = true;
        child.level = level;
        child.levelIndex = children.indexOf(child);
        child.parentID = parentId;
        child.parentExtracted = false;
        child.selfExtracted = false;
        this.types.push(child);
        await this.findAllChildrenTypes(child.children, child.expressID);
      }
    }
  }

  private async populateIFCCategories() {
    for (const category of Object.values(WEBIFC)) {
      if (this.filteredTypes.some(t => t.type === (category as any).type)) {
        this.allIFCCategories.push({
          type: (category as any).type,
          value: (category as any).value.toString() // Convert to string if number
        });
      }
    }
  }

  async setupAllCategories(scene: THREE.Scene) {
    const categories = Object.values(this.allIFCCategories);
    for (const category of categories) {
      const typeId = ifcTypeIds[category.type] || 0; // Fallback to 0 if not mapped
      this.subsets[category.value] = await this.newSubsetOfType(typeId, scene);
      scene.add(this.subsets[category.value]);
    }
  }

  private async newSubsetOfType(category: number, scene: THREE.Scene) {
    const ids = await this.ifc.getAllItemsOfType(0, category, false);
    return this.ifc.createSubset({
      modelID: 0,
      ids,
      scene,
      removePrevious: true,
      customID: category.toString()
    });
  }

  getTypes() {
    return this.types;
  }

  getFilteredTypes() {
    return this.filteredTypes;
  }

  getAllIFCCategories() {
    return this.allIFCCategories;
  }

  toggleCategoryVisibility(category: IfcCategory, checked: boolean, scene: THREE.Scene) {
    const uuid = this.subsets[category.value]?.uuid;
    const object = scene.getObjectByProperty('uuid', uuid);
    if (checked) {
      scene.add(this.subsets[category.value]);
    } else {
      object?.removeFromParent();
    }
  }

  async getItemProperties(modelID: number, expressID: number) {
    return await this.ifc.getItemProperties(modelID, expressID);
  }

  async getPropertySets(modelID: number, expressID: number) {
    return await this.ifc.getPropertySets(modelID, expressID);
  }

  getIfcType(modelID: number, expressID: number) {
    return this.ifc.getIfcType(modelID, expressID);
  }

  createSubset(options: { modelID: number, ids: number[], material?: THREE.Material, scene: THREE.Scene, removePrevious: boolean }) {
    return this.ifc.createSubset(options);
  }

  removeSubset(modelID: number, material?: THREE.Material) {
    this.ifc.removeSubset(modelID, material);
  }

  getExpressId(geometry: any, faceIndex: number) {
    return this.ifc.getExpressId(geometry, faceIndex);
  }

  getIfcModels() {
    return this.ifcModels;
  }
}
