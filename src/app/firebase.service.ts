import {ImageService} from "./image.service";
import {FirebaseConverter} from "./firebase.converter";
import {FirebaseFactory} from "./firebase.factory";
import {Entity} from "./entity";

export class FirebaseService {

    private firebaseRefs : { [key:string]:any; } = {};

    constructor(private baseEntitiesUrl:string,
                private imageService:ImageService,
                private firebaseConverter:FirebaseConverter) {
    }

    retrieve(key:string, fn) {
        var firebaseRef = this.getFirebaseRef(this.baseEntitiesUrl + '/' + key);
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

    retrieveAll(onAdded, onRemoved) {
        var thiz = this;
        var fbRef = this.getFirebaseRef(this.baseEntitiesUrl + '/');

        var fbCallback = function (data) {
            thiz.entityAdded(data, onAdded);
        };

        fbRef.on('child_added', fbCallback);
        fbRef.on('child_removed', function(data) {
            var entity = thiz.firebaseConverter.entityFromStorage(data.key, data.val());
            onRemoved.call(thiz, entity);
        });
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

    retrieveByCategory(categories, onAdded, onRemoved) {
        var thiz = this;
        var tagList = categories.map(function(tag) {
            return tag.replace(/ø/g, "oe").replace(/æ/g, "ae").replace(/å/g, "aa");});

        var recipesRef = this.getFirebaseRef(this.baseEntitiesUrl + "/")
            .orderByChild("tags_" + tagList.sort().join("&"))
            .equalTo(true);

        recipesRef.on('child_added', function (data) {
            thiz.entityAdded(data, onAdded);
        });
        recipesRef.on('child_removed', function (data) {
            var entity = thiz.firebaseConverter.entityFromStorage(data.key, data.val());
            onRemoved.call(this, entity);
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
            var fbRef = this.getFirebaseRef(this.baseEntitiesUrl + "/");

            //noinspection TypeScriptUnresolvedFunction
            fbRef.child(entity.key).set(this.firebaseConverter.entityForStorage(entity));
        }
        else {
            var fbRef = this.getFirebaseRef(this.baseEntitiesUrl + "/");
            var entityRef = fbRef.push(this.firebaseConverter.entityForStorage(entity));
            entity.key = entityRef.key;
        }
        callback.call(this, entity.key);
    }

    remove(entity:Entity) {
        var fbRef = this.getFirebaseRef(this.baseEntitiesUrl + "/");
        fbRef.child(entity.key).remove();
    }

    removeFromList(entityList: Entity[], entity: Entity) {
        var found = false;
        for (var i = 0; i < entityList.length; i++) {
            if (found) {
                entityList[i - 1] = entityList[i];
            } else {
                found = (entityList[i].key == entity.key);
            }
        }
        if (found) entityList.length = entityList.length - 1;
    }

    disconnect() {
        for (var key in this.firebaseRefs) {
            this.firebaseRefs[key].off();
            this.firebaseRefs[key] = null;
        }
    }

    disconnectEntity(key) {
        this.firebaseRefs[this.baseEntitiesUrl + "/" + key].off();
        this.firebaseRefs[this.baseEntitiesUrl + "/" + key] = null;
    }

    private getFirebaseRef(url: string) {
        if (!this.firebaseRefs[url])
            this.firebaseRefs[url] = FirebaseFactory.getFirebaseRef(url);

        return this.firebaseRefs[url];
    }
}

