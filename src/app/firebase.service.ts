import {ImageService} from "./image.service";
import {FirebaseConverter} from "./firebase.converter";
import {StorageService} from "./storage.service";
import {FirebaseFactory} from "./firebase.factory";
import {Entity} from "./entity";

export class FirebaseService extends StorageService {
    
    constructor(private baseEntitiesUrl:string,
                private imageService:ImageService,
                private firebaseConverter:FirebaseConverter) {
        super();
    }

    retrieve(key:string, fn) {
        var firebaseRef = FirebaseFactory.getFirebaseRef(this.baseEntitiesUrl + '/' + key);
        var thiz = this;

        firebaseRef.on('value', function (data) {
            var fbVal = data.val();
            if (fbVal) {
                var entity = thiz.firebaseConverter.entityFromStorage(data.key, fbVal);
                fn.call(thiz, entity);

                var imgCallback = function (img) {
                    entity.image = img;
                };
                thiz.imageService.getImage(fbVal.imageId, imgCallback);
            }
        });
    }

    retrieveAll(callback) {
        var thiz = this;
        var fbRef = FirebaseFactory.getFirebaseRef(this.baseEntitiesUrl + '/');

        var fbCallback = function (data) {
            thiz.entityAdded(data, callback);
        };
        fbRef.off('child_added', fbCallback); //TODO virker ikke, det er fortsatt flere lyttere på ressursen
        fbRef.on('child_added', fbCallback);
    }

    entityAdded(data, callback) {
        var fbVal = data.val();
        if (fbVal) {
            var entity = this.firebaseConverter.entityFromStorage(data.key, fbVal);
            callback.call(this, entity);

            var imgCallback = function (img) {
                entity.image = img;
            };
            this.imageService.getImage(entity.imageId, imgCallback);
        }
    }

    retrieveByCategory(category, callback) {
        var thiz = this;
        var tagList = category.replace(/ø/g, "oe").replace(/æ/g, "ae").replace(/å/g, "aa");
        var tags = tagList.split("&").sort().join("&");
        var recipesRef = FirebaseFactory.getFirebaseRef(this.baseEntitiesUrl + "/")
            .orderByChild("tags_" + tags)
            .equalTo(true);

        recipesRef.on('child_added', function (data) {
            thiz.entityAdded(data, callback);
        });
    }

    save(entity:Entity, callback) {
        var thisService = this;
        if (entity.image) {
            var callbackImg = function(imageKey) {
                entity.imageId = imageKey;
                thisService.saveEntityOnly(entity, callback);
            };
            this.imageService.saveImage(entity.image, entity.imageId, callbackImg);
        }
        else {
            this.saveEntityOnly(entity, callback);
        }
    }

    saveEntityOnly(entity:Entity, callback) {
        if (entity.key) {
            var fbRef = FirebaseFactory.getFirebaseRef(this.baseEntitiesUrl + "/");

            //noinspection TypeScriptUnresolvedFunction
            fbRef.child(entity.key).set(this.firebaseConverter.entityForStorage(entity));
        }
        else {
            var fbRef = FirebaseFactory.getFirebaseRef(this.baseEntitiesUrl + "/");
            var entityRef = fbRef.push(this.firebaseConverter.entityForStorage(entity));
            entity.key = entityRef.key;
        }
        callback.call(this, entity.key);
    }

    remove(entity:Entity) {
        var fbRef = FirebaseFactory.getFirebaseRef(this.baseEntitiesUrl + "/");
        fbRef.child(entity.key).remove();
    }
}

