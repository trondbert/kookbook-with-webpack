import {RecipeMockService} from "./recipes/recipe.mock.service";
import {RecipeFirebaseService} from "./recipes/recipe.firebase.service";
import {RecipeService} from "./recipes/recipe.service";
import {BeverageFirebaseService} from "./recipes/beverage.firebase.service";

export class ServiceFactory {

    static getRecipeService():any {
        if (window["recipeServiceProvider"])
            return RecipeMockService;

        return RecipeFirebaseService;
    }

    static getBeverageService():any {
        if (window["beverageServiceProvider"])
            return RecipeMockService;

        return BeverageFirebaseService;
    }
}
