import {Component, OnInit} from '@angular/core';

import {Router} from "@angular/router";
import {Recipe} from "./recipe";
import {RecipeService} from "./recipe.service";
import {StaticData} from "../static.data";
import {RecipeValidator} from "./recipe.validator";

@Component({
  selector: 'recipes/new',
  templateUrl: '../layout/recipe-edit.template.html',
  styleUrls: ['../layout/app.style.css', '../layout/recipe-edit.style.css']
})
export class RecipesNewComponent implements OnInit {

  private recipe:Recipe;
  private placeholderImage;
  private errors = [];

  constructor(private router:Router,
              private recipeService:RecipeService ) {

  }

  ngOnInit() {
    this.recipe = new Recipe();
    this.placeholderImage = StaticData.placeholderImage;
  }

  save() {
    var thiz = this;
    this.errors = new RecipeValidator().validate(this.recipe);
    if (this.errors.length > 0) {
      return;
    }
    var callback = function(recipeKey) {
      let link = ['recipes/' + recipeKey];
      thiz.router.navigate(link);
    };
    this.recipeService.save(this.recipe, callback);
  }

  backToRecipes() {
    let link=['Recipes'];
    this.router.navigate(link);
  }

  chooseImg() {
    document.getElementById("imageChooser").click()
  }

  imgChosen(event) {
    var thiz = this;

    var reader = new FileReader();
    reader.onloadend = function (e:ProgressEvent) {
      var hasResult:FileReader = <FileReader>(e.target);
      //noinspection TypeScriptUnresolvedVariable
      thiz.recipe.image = {"imageData": hasResult.result};
    };
    reader.readAsDataURL(event.target.files[0]);
  }
}