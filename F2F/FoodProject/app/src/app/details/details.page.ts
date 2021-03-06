import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { RestService } from '../rest.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import {Location} from '@angular/common';

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
})

export class DetailsPage implements OnInit {
  recipe : any;
  api : RestService;
  id : string;
  myImage: string;
  ingredients: any;
  ingredientNames : any;
  favoriRecipesNames : any;

  isIndeterminate:boolean;
  masterCheck:boolean;
  oneBoxChecked:boolean;
  checked:any;
  isInFavoris:boolean;

  constructor(public restapi: RestService, public loadingController: LoadingController, private route: ActivatedRoute, private alertCtrl: AlertController, public navCtrl: NavController, private _location: Location) {

    this.api = restapi;

  }

async getRecipe(id:any) {


    const loading = await this.loadingController.create({
      message: 'Loading'
    });
    await loading.present();

    await this.api.getRecipe(this.id)
      .subscribe(res => {
        this.recipe = res[0].recipe;
        //this.myImage=this.recipe.image_url;
        this.myImage = "https://img.icons8.com/bubbles/2x/food.png";
        this.ingredients=[];
        for (var i = 0; i < this.recipe.ingredients.length; i++) {
          var currentIngredient = this.recipe.ingredients[i];
          var currentJson = {name:currentIngredient,isChecked:false};
          this.ingredients.push(currentJson);
        }
        loading.dismiss();
      }, err => {
        console.log(err);
        loading.dismiss();
      });

  }

  async getCart() {
    const loading = await this.loadingController.create({
        message: 'Loading'
      });
      await loading.present();

      this.ingredientNames = [];

      await this.api.getCart().subscribe(res => {

      for (var j = 0; j < res.length; j++) {
        var currentIngredientName = res[j].ingredient;
        this.ingredientNames.push(currentIngredientName);
      }
      loading.dismiss();
      },err => {
        console.log(err);
        loading.dismiss();
      });
      console.log(this.ingredientNames);
  }

  checkMaster() {
    setTimeout(()=>{
      this.ingredients.forEach(obj => {
        obj.isChecked = this.masterCheck;
      });
    });
  }
 
  checkEvent() {
    const totalItems = this.ingredients.length;
    this.checked = 0;
    this.ingredients.map(obj => {
      if (obj.isChecked) this.checked++;
    });
    if (this.checked > 0 && this.checked < totalItems) {
      //If even one item is checked but not all
      this.isIndeterminate = true;
      this.masterCheck = false;
      this.oneBoxChecked = true;
    } else if (this.checked == totalItems) {
      //If all are checked
      this.masterCheck = true;
      this.isIndeterminate = false;
      this.oneBoxChecked = true;
    } else {
      //If none is checked
      this.isIndeterminate = false;
      this.masterCheck = false;
      this.oneBoxChecked = false;
    }
  }

  addToCart() {
      this.ingredients.forEach((item) => {

     // console.log(this.ingredientNames.length);
      var isInCart = this.ingredientNames.includes(item.name);
      if ((item.isChecked == true) && (isInCart == false)) {
        this.ingredientNames.push(item.name);
        this._addToCart(item.name);
      }
    });
  }

  async _addToCart(name:any) {

    await this.api.addIngredient(name)
          .subscribe(res => {
            console.log(res);
          });
  }

  showAlert() {
      let msg;
      if (this.checked > 1) {
        msg = "Ingrédients ajoutés !";
      }
      else {
        msg = "Ingrédient ajouté !";
      }

      let alert = this.alertCtrl.create({       
        message: msg,
        buttons: [
        {
          text: 'Rester sur cette page',
          role: 'cancel'
        },
        {
          text: "Retourner à l'acceuil",
          handler: () => {
                this.navCtrl.navigateRoot('home');
              }
        }]             
      }).then(alert=>alert.present());
      //setTimeout(()=>{
      //    alert.dismiss().then(alert=>alert.dismiss());
      //}, 50);
      
    }

    async getFavoris() {
    const loading = await this.loadingController.create({
        message: 'Loading'
      });
      await loading.present();

      this.favoriRecipesNames = [];
      this.isInFavoris = false;
      await this.api.getFavoriRecipes().subscribe(res => {
      for (var j = 0; j < res.length; j++) {
        this.api.getRecipe(res[j].id).subscribe(res1 => {

          var currentRecipeName = res1[0].recipe.title;
          var currentImage = "http://www.gfnds.com/2017/en/upload/20170321/20170321203032.jpg";
          var currentId = res1[0]._id;
          if (currentId == this.id) {
            this.isInFavoris = true;
          }
          var currentJsonRecipeName = {name:currentRecipeName, image:currentImage, id:currentId};
          this.favoriRecipesNames.push(currentJsonRecipeName);
      });
      }
      loading.dismiss();
      
      },err => {
        loading.dismiss();
      });
  }

  addToFavourites() {
    console.log(this.isInFavoris);
    if (this.isInFavoris == false){
      this.addFavoriRecipe();
      let alert = this.alertCtrl.create({       
        message: "Ajouté en favoris!",
        buttons: [
        {
          text: 'Rester sur cette page',
          role: 'cancel'
        },
        {
          text: "Retourner à l'acceuil",
          handler: () => {
                this.navCtrl.navigateRoot('home');
              }
        }]             
      }).then(alert=>alert.present());

        }
    else{
        this.deleteFavoriRecipe();
        let alert = this.alertCtrl.create({       
        message: "Retiré des favoris",
        buttons: [
        {
          text: 'Rester sur cette page',
          role: 'cancel'
        },
        {
          text: "Retourner à l'acceuil",
          handler: () => {
                this.navCtrl.navigateRoot('home');
              }
        }]             
      }).then(alert=>alert.present());
      }
  }

  async deleteFavoriRecipe() {
    await this.api.deleteFavoriRecipe(this.id)
      .subscribe(res => {
        console.log(res);
        this.isInFavoris = false;
      }, err => {
        console.log(err);
    });
  }

  async addFavoriRecipe() {
    await this.api.addFavoriRecipe(this.id)
          .subscribe(res => {
        console.log(res);
        this.isInFavoris = true;
      }, err => {
        console.log(err);
    });
  }

  ngOnInit() {
    this.recipe={};
    this.oneBoxChecked = false;
    this.route.paramMap.subscribe((params : ParamMap)=> {
      this.id=params.get('id');
    });
    this.getRecipe(this.id);
    this.getCart();
    this.getFavoris();
  }

}
 
