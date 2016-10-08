import {GenericComponent} from "../generic.component";
import {BeverageService} from "./beverage.service";
import {Beverage} from "./beverage";
import {AppState} from "../app.service";


export abstract class BeverageComponent extends GenericComponent {

    constructor(private mode:string,
                private beverageService:BeverageService,
                private appState: AppState) {
        super();
    }

    ngOnInit() {
        super.ngOnInit();
    }

    getAppState(): AppState {
        return this.appState;
    }

    getBeverageService() {
        return this.beverageService;
    }

    abstract getBeverage() : Beverage;

    editBeverage() {
        let link = ['/beverages/' + this.getBeverage().key + '/edit/'];
        this.getRouter().navigate(link);
    }

    deleteBeverage() {
        if (this.getBeverage()) {
            confirm("Vil du virkelig slette vinen?");
            this.beverageService.remove(this.getBeverage());
            let link = ['/beverages'];
            this.getRouter().navigate(link);
        }
    }
}
