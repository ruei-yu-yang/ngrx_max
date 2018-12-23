import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Effect, Actions } from '@ngrx/effects';
import * as RecipeActions from '../store/recipe.actions';
import * as fromRecipe from '../store/recipe.reducers';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/withLatestFrom';
import { Recipe } from '../recipe.model';
import { Store } from '@ngrx/store';
import { HttpRequest } from '@angular/common/http';

@Injectable()
export class RecipeEffects {
  @Effect()
  recipeFetch = this.actions$
    .ofType(RecipeActions.FETCH_RECIPES)
    .switchMap((action: RecipeActions.FetchRecipes) => {
      return this.httpClient.get<Recipe[]>(
        'https://ng-recipe-book-cc53e.firebaseio.com/recipes.json',
        {
          observe: 'body',
          responseType: 'json'
        }
      );
    })
    .map(recipes => {
      console.log(recipes);
      for (const recipe of recipes) {
        if (!recipe['ingredients']) {
          recipe['ingredients'] = [];
        }
      }
      return {
        type: RecipeActions.SET_RECIPES,
        payload: recipes
      };
    });

    @Effect({dispatch: false})
    recipeStore = this.actions$
      .ofType(RecipeActions.STORE_RECIPES)
      .withLatestFrom(this.store.select('recipes'))
      .switchMap(([action, state]) => {
        const req = new HttpRequest('PUT', 'https://ng-recipe-book-cc53e.firebaseio.com/recipes.json',
          state.recipes, { reportProgress: true });
          return this.httpClient.request(req);
      });

  constructor(private actions$: Actions, private httpClient: HttpClient, private store: Store<fromRecipe.FeatureState>) {}
}
