const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RecipeFavoriSchema = new Schema(
    {
        id : String
    });

module.exports = mongoose.model('FavoriRecipe',RecipeFavoriSchema);