export function setInteractive(gameObject, config = {}) {
    let scene = gameObject.scene;

    if (scene.registry.get("pointerOver") != null) {
        config.cursor = `url(${scene.registry.get("pointerOver")}), pointer`;
    }
    else {
        config.useHandCursor = true;
    }

    gameObject.setInteractive(config);

    let defaultDisableInteractive = gameObject.disableInteractive.bind(gameObject);

    gameObject.disableInteractive = () => {
        defaultDisableInteractive(true);
        gameObject.disableInteractive = defaultDisableInteractive;
    }
}