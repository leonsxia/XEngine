class temp {

    leftPlayerd = false;
    rightPlayed = false;

    mixerTick(delta) {

        this.AWS.mixer.update(delta);

        for (let i = 0, il = this.weapons.length; i < il; i++) {

            const weapon = this.weapons[i];

            if (!weapon.visible) continue;

            weapon.AWS?.mixer.update(delta);

        }

        const walkAction = this.AWS.actions[this._clips.WALK.nick].action;
        // console.log(`time: ${this.AWS.actions[this._clips.WALK.nick].action.time}, timeScale: ${this.AWS.actions[this._clips.WALK.nick].action.timeScale}`);
        if (this.isForward) {

            if (walkAction.time < 0.8) {

                if (!this.leftPlayerd) console.log(`step: left`);
                this.leftPlayerd = true;
                this.rightPlayed = false;

            } else {

                if (!this.rightPlayed) console.log(`step: right`);
                this.leftPlayerd = false;
                this.rightPlayed = true;

            }

        }

    }

}

export { temp };