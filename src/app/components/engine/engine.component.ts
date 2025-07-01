import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NgZone } from '@angular/core';
import * as THREE from 'three';
import { IfcService } from '../../services/ifc.service';
import { ThreeJsService } from '../../services/three-js.service';
import { parseElementDetailsFromIFCExpressID } from '../../utils/ifc-utils';
import { IfcMetadata, SearchResult } from '../../models/interfaces';


@Component({
  selector: 'app-engine',
  templateUrl: './engine.component.html'
})
export class EngineComponent implements OnInit, OnDestroy {
  @ViewChild('c1', { static: true }) rendererCanvas: ElementRef<HTMLCanvasElement>;

  ifcurl: string;
  ifcFileName: string;
  isLoading = false;
  isUploading = false;
  loadingMessage = '';
  isErrorHappened = false;
  isFullScreen = false;
  isBasePlaneOn = true;
  isAxesHelperOn = true;
  isLiveDetailsOn = true;
  showSearchLoading = false;
  searchString: string;
  allDetailsForSearch: SearchResult[] = [];
  resultErrorMessage: string;
  elementIfcType: string;
  selectedItemProperties: any[] = [];
  selectedItemPropertySets: any[] = [];
  ifcTypesSelectedDetails: any[] = [];
  hoveredObjectType: any;
  selectedModelID: any;
  elementListModalOpen = false;
  elementDetailsModalOpen = false;
  elementTreeModalOpen = false;
  metadataModalOpen = false;
  isControlPanelModalOpen = false;
  searchInputModalOpen = false;
  buttonListModalOpen = false;
  liveDetailsModal = true;
  IFCAPPLICATION: IfcMetadata[] = [];
  IFCORGANIZATION: IfcMetadata[] = [];
  IFCPOSTALADDRESS: IfcMetadata[] = [];
  IFCTELECOMADDRESS: IfcMetadata[] = [];
  IFCPERSON: IfcMetadata[] = [];

  private ifcText: string;

  constructor(
    private ngZone: NgZone,
    public ifcService: IfcService,
    public threeJsService: ThreeJsService
  ) {}

  ngOnInit(): void {
    console.log('Renderer Canvas:', this.rendererCanvas);
    if (this.rendererCanvas && this.rendererCanvas.nativeElement) {
      this.threeJsService.initializeScene(this.rendererCanvas);
    } else {
      console.error('Canvas element not found. Check template for #c1.');
    }
    if (this.ifcurl) {
      this.isLoading = true;
      this.ifcFileName = this.ifcurl.substring(this.ifcurl.lastIndexOf('=') + 1);
      this.loadIfcModel();
    }
    this.setupFullscreenListeners();
  }

  ngOnDestroy(): void {
    this.threeJsService.cleanup();
  }

  private setupFullscreenListeners() {
    const fullscreenChange = () => this.isFullScreen = !this.isFullScreen;
    document.addEventListener('webkitfullscreenchange', fullscreenChange, false);
    document.addEventListener('mozfullscreenchange', fullscreenChange, false);
    document.addEventListener('fullscreenchange', fullscreenChange, false);
    document.addEventListener('MSFullscreenChange', fullscreenChange, false);
    document.addEventListener('keydown', (e) => {
      if (e.shiftKey) document.body.classList.add('cursor-move');
    });
    document.addEventListener('keyup', (e) => {
      if (!e.shiftKey) document.body.classList.remove('cursor-move');
    });
  }

  private async loadIfcModel() {
    try {
      await this.ifcService.loadIfc(
        this.ifcurl,
        this.threeJsService.getScene(),
        (progress) => {
          this.isLoading = true;
          this.loadingMessage = `Loading IFC Model: ${Math.round((progress.loaded / progress.total) * 100)}%`;
        },
        (error) => {
          this.isErrorHappened = true;
          this.isLoading = false;
          this.loadingMessage = 'Failed to load IFC model';
          console.error(error);
        }
      );
      this.isLoading = false;
      this.threeJsService.animate(this.ngZone);
    } catch (error) {
      this.isErrorHappened = true;
      this.isLoading = false;
      this.loadingMessage = 'Failed to load IFC model';
    }
  }

  fileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.isErrorHappened = true;
      this.loadingMessage = 'Please select a valid IFC file';
      return;
    }

    this.isUploading = true;
    this.isLoading = true;
    this.loadingMessage = 'Reading IFC file';
    const file = input.files[0];
    this.ifcFileName = file.name;

    const arrayBufferReader = new FileReader();
    arrayBufferReader.onload = (e) => {
      const blob = new Blob([e.target.result], { type: 'application/octet-stream' });
      this.ifcurl = URL.createObjectURL(blob);
      this.loadIfcModel();
    };
    arrayBufferReader.onerror = () => {
      this.isErrorHappened = true;
      this.isUploading = false;
      this.isLoading = false;
      this.loadingMessage = 'Error reading IFC file';
    };
    arrayBufferReader.readAsArrayBuffer(file);

    const textReader = new FileReader();
    textReader.onload = (e) => {
      this.ifcText = e.target.result as string;
      this.fetchMetadataFromIFC(this.ifcText);
    };
    textReader.onerror = () => {
      this.isErrorHappened = true;
      this.isUploading = false;
      this.isLoading = false;
      this.loadingMessage = 'Error reading IFC file text';
    };
    textReader.readAsText(file);
  }

  controlChange(control: string) {
    if (control === 'base_plane') {
      this.isBasePlaneOn = !this.isBasePlaneOn;
      this.threeJsService.toggleGridHelper(this.isBasePlaneOn);
    } else if (control === 'axes_helper') {
      this.isAxesHelperOn = !this.isAxesHelperOn;
      this.threeJsService.toggleAxesHelper(this.isAxesHelperOn);
    } else if (control === 'live_details') {
      this.isLiveDetailsOn = !this.isLiveDetailsOn;
    }
  }

  fullScreen() {
    if (!this.isFullScreen) {
      this.closeAllModals();
      const elem = document.documentElement as any;
      elem.requestFullscreen?.() ||
      elem.mozRequestFullScreen?.() ||
      elem.webkitRequestFullscreen?.() ||
      elem.msRequestFullscreen?.();
    } else {
      const doc = document as any;
      doc.exitFullscreen?.() ||
      doc.mozCancelFullScreen?.() ||
      doc.webkitExitFullscreen?.() ||
      doc.msExitFullscreen?.();
    }
  }

  async doubleClickedEvent(event: any) {
    const found = this.cast(event)[0];
    if (found) {
      const index = found.faceIndex;
      const geometry = (found.object as THREE.Mesh).geometry;
      const id = this.ifcService.getExpressId(geometry, index);
      this.showElementDetails(id);
    } else {
      this.ifcService.removeSubset(0, this.ifcService.selectMat);
      this.ifcService.removeSubset(0, this.ifcService.preselectMat);
      this.elementDetailsModalOpen = false;
      this.elementIfcType = null;
    }
  }

  async mouseOverEvent(event: any) {
    if (this.isLiveDetailsOn) {
      const found = this.cast(event)[0];
      if (found) {
        const index = found.faceIndex;
        const geometry = (found.object as THREE.Mesh).geometry;
        const id = this.ifcService.getExpressId(geometry, index);
        this.hoveredObjectType = parseElementDetailsFromIFCExpressID(this.ifcText, id);
        this.ifcService.createSubset({
          modelID: 0,
          ids: [id],
          material: this.ifcService.preselectMat,
          scene: this.threeJsService.getScene(),
          removePrevious: true
        });
      } else {
        this.ifcService.removeSubset(0, this.ifcService.preselectMat);
        this.hoveredObjectType = null;
      }
    }
  }

  private cast(event: any): THREE.Intersection<THREE.Mesh>[] {
    const bound = this.rendererCanvas.nativeElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - bound.left) / (bound.right - bound.left)) * 2 - 1,
      -((event.clientY - bound.top) / (bound.bottom - bound.top)) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.threeJsService.getCamera());
    return raycaster.intersectObjects(this.ifcService.getIfcModels()) as THREE.Intersection<THREE.Mesh>[];
  }

  closeAllModals() {
    this.elementListModalOpen = false;
    this.elementDetailsModalOpen = false;
    this.elementTreeModalOpen = false;
    this.metadataModalOpen = false;
    this.isControlPanelModalOpen = false;
    this.searchInputModalOpen = false;
    this.buttonListModalOpen = false;
  }

  async searchFunction(searchString: string) {
    if (!searchString) {
      this.resultErrorMessage = 'Please enter a valid value.';
      return;
    }
    this.resetAllDetails();
    this.elementIfcType = null;
    this.elementDetailsModalOpen = false;
    this.searchString = searchString;
    this.allDetailsForSearch = [];
    this.showSearchLoading = true;

    const types = this.ifcService.getTypes();
    for (const type of types) {
      if (type.expressID.toString().includes(searchString) || type.type.toLowerCase().includes(searchString)) {
        this.allDetailsForSearch.push({ type: type.type, expressID: type.expressID });
      }
      await this.showSearchDetails(type.expressID, searchString);
    }
    if (this.allDetailsForSearch.length === 0) {
      this.resultErrorMessage = `No result found for '${searchString}'`;
    }
    this.showSearchLoading = false;
  }

  private async showSearchDetails(expressID: number, query: string) {
    const properties = await this.ifcService.getItemProperties(0, expressID);
    for (const key in properties) {
      const prop = properties[key];
      if (prop?.value && typeof prop.value !== 'number' && (key.toLowerCase().includes(query) || prop.value.toString().toLowerCase().includes(query))) {
        if (!this.allDetailsForSearch.find(o => o.expressID === expressID)) {
          this.allDetailsForSearch.push({ name: key, type: this.ifcService.getIfcType(0, expressID), expressID, value: prop.value });
        }
      }
    }
    const propertySets = await this.ifcService.getPropertySets(0, expressID);
    for (const set of propertySets) {
      if (set.Quantities) {
        for (const quantity of set.Quantities) {
          const details = parseElementDetailsFromIFCExpressID(this.ifcText, quantity.value);
          if (details.name.toLowerCase().includes(query) || details.value.toLowerCase().includes(query)) {
            if (!this.allDetailsForSearch.find(o => o.expressID === expressID)) {
              this.allDetailsForSearch.push({ ...details, type: this.ifcService.getIfcType(0, expressID), expressID });
            }
          }
        }
      }
      if (set.HasProperties) {
        for (const prop of set.HasProperties) {
          const details = parseElementDetailsFromIFCExpressID(this.ifcText, prop.value);
          if (details.name.toLowerCase().includes(query) || details.value.toLowerCase().includes(query)) {
            if (!this.allDetailsForSearch.find(o => o.expressID === expressID)) {
              this.allDetailsForSearch.push({ ...details, type: this.ifcService.getIfcType(0, expressID), expressID });
            }
          }
        }
      }
    }
    this.elementIfcType = this.ifcService.getIfcType(0, expressID);
  }

  private fetchMetadataFromIFC(ifcText: string) {
    const metaDataVariables = ['IFCAPPLICATION', 'IFCORGANIZATION', 'IFCPOSTALADDRESS', 'IFCTELECOMADDRESS', 'IFCPERSON', 'IFCACTORROLE'];
    for (const variable of metaDataVariables) {
      let pos = -1;
      while ((pos = ifcText.indexOf(variable, pos + 1)) !== -1) {
        let line = '';
        for (let i = pos; i < pos + 10000; i++) {
          if (ifcText[i] === '\n' || ifcText[i] === '\r') break;
          line += ifcText[i];
        }
        let value = '';
        let foundFirstQuote = false;
        for (const char of line) {
          if (char === '\'' || char === '"') foundFirstQuote = !foundFirstQuote;
          if (foundFirstQuote) value += char;
          if (char === '$') value += '\'';
        }
        const values = value.split('\'').filter(v => v);
        switch (variable) {
          case 'IFCORGANIZATION':
            this.IFCORGANIZATION.push(
              { name: 'Organization ID', value: values[0] },
              { name: 'Organization Name', value: values[1] },
              { name: 'Organization Description', value: values[2] }
            );
            break;
          case 'IFCAPPLICATION':
            this.IFCAPPLICATION.push(
              { name: 'Application Version', value: values[0] },
              { name: 'Application Name', value: values[1] },
              { name: 'Application Identifier', value: values[2] }
            );
            break;
          case 'IFCTELECOMADDRESS':
            this.IFCTELECOMADDRESS.push(
              { name: 'Contact Number', value: values[3] },
              { name: 'Email ID', value: values[6] },
              { name: 'Website', value: values[7] }
            );
            break;
          case 'IFCPOSTALADDRESS':
            this.IFCPOSTALADDRESS.push(
              { name: 'Internal Location', value: values[3] },
              { name: 'Address', value: values[4] },
              { name: 'Postal Box Address', value: values[5] },
              { name: 'Town', value: values[6] },
              { name: 'Region', value: values[7] },
              { name: 'Postal Code', value: values[8] },
              { name: 'Country', value: values[9] }
            );
            break;
          case 'IFCPERSON':
            this.IFCPERSON.push(
              { name: 'ID', value: values[0] },
              { name: 'Full Name', value: `${values[4]} ${values[2]} ${values[3]} ${values[1]} ${values[5]}`.trim() }
            );
            break;
          case 'IFCACTORROLE':
            this.IFCPERSON.push(
              { name: 'Actor Role (User Defined)', value: values[0] },
              { name: 'Actor Role Description', value: values[1] }
            );
            break;
        }
      }
    }
    this.isLoading = false;
    this.isUploading = false;
  }

  resetAllDetails() {
    this.ifcTypesSelectedDetails = [];
    this.selectedItemProperties = [];
    this.selectedItemPropertySets = [];
    this.elementIfcType = null;
  }

  resetEverything() {
    this.isBasePlaneOn = true;
    this.isAxesHelperOn = true;
    this.isLiveDetailsOn = true;
    this.closeAllModals();
    this.resetAllDetails();
    this.threeJsService.toggleGridHelper(true);
    this.threeJsService.toggleAxesHelper(true);
    this.ngOnInit();
  }

  exitViewer() {
    this.closeAllModals();
    this.resetEverything();
    this.IFCAPPLICATION = [];
    this.IFCORGANIZATION = [];
    this.IFCPOSTALADDRESS = [];
    this.IFCTELECOMADDRESS = [];
    this.IFCPERSON = [];
    this.ifcurl = null;
    this.ifcFileName = null;
    window.location.reload();
  }

  async showElementDetails(expressID: number) {
    this.resetAllDetails();
    this.elementDetailsModalOpen = true;

    const properties = await this.ifcService.getItemProperties(0, expressID);
    for (const key in properties) {
      const prop = properties[key];
      if (prop?.value && typeof prop.value !== 'number') {
        this.ifcTypesSelectedDetails.push({ name: key, value: prop.value });
      } else if (prop?.value && typeof prop.value === 'number' && prop.type !== 5) {
        this.ifcTypesSelectedDetails.push({ name: key, value: prop.value });
      } else if (prop !== null && key === 'expressID') {
        this.ifcTypesSelectedDetails.push({ name: key, value: prop });
      }
    }

    const propertySets = await this.ifcService.getPropertySets(0, expressID);
    for (const set of propertySets) {
      let propertyList: any[] = [];
      if (set.Quantities) {
        for (const quantity of set.Quantities) {
          const details = parseElementDetailsFromIFCExpressID(this.ifcText, quantity.value);
          propertyList.push(details);
        }
      }
      if (set.HasProperties) {
        for (const prop of set.HasProperties) {
          const details = parseElementDetailsFromIFCExpressID(this.ifcText, prop.value);
          propertyList.push(details);
        }
      }
      if (set.Name?.value) {
        this.selectedItemPropertySets.push({ propertyset: set.Name.value, data: propertyList });
      }
    }
    this.elementIfcType = this.ifcService.getIfcType(0, expressID);
  }
}
