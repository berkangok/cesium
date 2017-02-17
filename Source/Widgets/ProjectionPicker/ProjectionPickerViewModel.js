/*global define*/
define([
        '../../Core/Cartesian3',
        '../../Core/defaultValue',
        '../../Core/defined',
        '../../Core/defineProperties',
        '../../Core/destroyObject',
        '../../Core/DeveloperError',
        '../../Core/Math',
        '../../Core/Matrix4',
        '../../Scene/OrthographicFrustum',
        '../../Scene/PerspectiveFrustum',
        '../../ThirdParty/knockout',
        '../createCommand'
    ], function(
        Cartesian3,
        defaultValue,
        defined,
        defineProperties,
        destroyObject,
        DeveloperError,
        CesiumMath,
        Matrix4,
        OrthographicFrustum,
        PerspectiveFrustum,
        knockout,
        createCommand) {
    'use strict';

    /**
     * The view model for {@link ProjectionPicker}.
     * @alias ProjectionPickerViewModel
     * @constructor
     *
     * @param {Scene} scene The Scene to switch projections.
     */
    function ProjectionPickerViewModel(scene) {
        //>>includeStart('debug', pragmas.debug);
        if (!defined(scene)) {
            throw new DeveloperError('scene is required.');
        }
        //>>includeEnd('debug');

        this._scene = scene;
        this._orthographic = scene.camera.frustum instanceof OrthographicFrustum;

        /**
         * Gets or sets whether the button drop-down is currently visible.  This property is observable.
         * @type {Boolean}
         * @default false
         */
        this.dropDownVisible = false;

        /**
         * Gets or sets the perspective projection tooltip.  This property is observable.
         * @type {String}
         * @default 'Perspective Projection'
         */
        this.tooltipPerspective = 'Perspective Projection';

        /**
         * Gets or sets the orthographic projection tooltip.  This property is observable.
         * @type {String}
         * @default 'Orthographic Projection'
         */
        this.tooltipOrthographic = 'Orthographic Projection';

        knockout.track(this, ['_orthographic', 'dropDownVisible', 'tooltipPerspective', 'tooltipOrthographic']);

        /**
         * Gets the currently active tooltip.  This property is observable.
         * @type {String}
         */
        this.selectedTooltip = undefined;

        var that = this;
        knockout.defineProperty(this, 'selectedTooltip', function() {
            if (that._scene.camera.frustum instanceof OrthographicFrustum) {
                return that.tooltipOrthographic;
            }
            return that.tooltipPerspective;
        });

        this._toggleDropDown = createCommand(function() {
            that.dropDownVisible = !that.dropDownVisible;
        });

        this._switchToPerspective = createCommand(function() {
            var scene = that._scene;
            var camera = that._scene.camera;
            camera.frustum = new PerspectiveFrustum();
            camera.frustum.aspectRatio = scene.drawingBufferWidth / scene.drawingBufferHeight;
            camera.frustum.fov = CesiumMath.toRadians(60.0);
            that._orthographic = false;
        });

        this._switchToOrthographic = createCommand(function() {
            var scene = that._scene;
            var camera = that._scene.camera;
            camera.frustum = new OrthographicFrustum();
            camera.frustum.aspectRatio = scene.drawingBufferWidth / scene.drawingBufferHeight * 0.3;
            camera.frustum.width = Matrix4.equals(Matrix4.IDENTITY, camera.transform) ? camera.positionCartographic.height : Cartesian3.magnitude(camera.position);
            that._orthographic = true;
        });
    }

    defineProperties(ProjectionPickerViewModel.prototype, {
        /**
         * Gets the scene
         * @memberof ProjectionPickerViewModel.prototype
         * @type {Scene}
         */
        scene : {
            get : function() {
                return this._scene;
            }
        },

        /**
         * Gets the command to toggle the drop down box.
         * @memberof ProjectionPickerViewModel.prototype
         *
         * @type {Command}
         */
        toggleDropDown : {
            get : function() {
                return this._toggleDropDown;
            }
        },

        /**
         * Gets the command to switch to a perspective projection.
         * @memberof ProjectionPickerViewModel.prototype
         *
         * @type {Command}
         */
        switchToPerspective : {
            get : function() {
                return this._switchToPerspective;
            }
        },

        /**
         * Gets the command to switch to orthographic projection.
         * @memberof ProjectionPickerViewModel.prototype
         *
         * @type {Command}
         */
        switchToOrthographic : {
            get : function() {
                return this._switchToOrthographic;
            }
        }
    });

    /**
     * @returns {Boolean} true if the object has been destroyed, false otherwise.
     */
    ProjectionPickerViewModel.prototype.isDestroyed = function() {
        return false;
    };

    /**
     * Destroys the view model.
     */
    ProjectionPickerViewModel.prototype.destroy = function() {
        destroyObject(this);
    };

    return ProjectionPickerViewModel;
});
