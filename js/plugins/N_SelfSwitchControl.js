/* 
 * MIT License
 * 
 * Copyright (c) 2020 Nolonar
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

//=============================================================================
// N_SelfSwitchControl
//=============================================================================
/*:
 * @target MZ
 * @plugindesc Control Self Switches from any event on any map.
 * @author Nolonar
 * @url https://github.com/Nolonar/RM_Plugins-SelfSwitchControl
 * 
 * 
 * @command selfswitch
 * @text Self Switch
 * @desc Control Self Switch.
 * 
 * @arg state
 * @text State
 * @desc The new state of the Self Switch.
 * @type select
 * @option On
 * @option Off
 * @option Toggle
 * @default On
 * 
 * @arg map
 * @text Map
 * @desc The map on which the event is. Use 0 for current map.
 * @type number
 * @min 0
 * @default 0
 * 
 * @arg event
 * @text Event
 * @desc The event to target. Enter a number (#), a range of numbers (#-#), or "all".
 * @type combo
 * @option all
 * @default all
 * 
 * @arg switch
 * @text Switch
 * @desc The Self Switch to change.
 * @type select
 * @option A
 * @option B
 * @option C
 * @option D
 * @default A
 * 
 * 
 * @help Version 1.1.1
 * ============================================================================
 * Plugin Commands
 * ============================================================================
 * Self Switch
 *      State:  Which state to change the Self Switch to.
 *              Toggle will set the state to On if Off, and to Off otherwise.
 * 
 *      Map:    Number representing the ID of the map where the event is found.
 *              If 0, will target events on the same map.
 * 
 *      Event:  The affected events. Examples:
 *                  3:      affects event 3.
 *                  2,4:    affects events 2 and 4.
 *                  5-12:   affects events 5 to 12.
 *                  1-3,5:  affects events 1 to 3, and 5.
 *                  all:    affects all events on the map.
 * 
 *      Switch: The Self Switch to change.
 */

(() => {
    //=========================================================================
    // Constants
    //=========================================================================
    const PLUGIN_NAME = "N_SelfSwitchControl";
    const COMMAND_SELFSWITCH = "selfswitch";
    const COMMAND_ARG_STATE_ON = "On";
    const COMMAND_ARG_STATE_OFF = "Off";
    const COMMAND_ARG_STATE_TOGGLE = "Toggle";
    const COMMAND_ARG_EVENT_ALL = "all"
    const COMMAND_ARG_EVENT_SEPARATOR = ",";
    const COMMAND_ARG_EVENT_RANGE_SEPARATOR = "-";

    PluginManager.registerCommand(PLUGIN_NAME, COMMAND_SELFSWITCH, function (args) {
        const mapId = Number(args.map) || this._mapId;
        for (const eventId of getEventIds(args.event))
            changeSelfSwitch(mapId, eventId, args.switch, args.state);
    });

    function* getEventIds(events) {
        if (events === COMMAND_ARG_EVENT_ALL) {
            for (const id of getAllEventIDs())
                yield id;
        } else {
            const groups = events.replace(/\s/g, "").split(COMMAND_ARG_EVENT_SEPARATOR);
            for (const range of groups) {
                for (const id of getEventIDsInRange(range))
                    yield id;
            }
        }
    }

    function* getEventIDsInRange(range) {
        const split = range.split(COMMAND_ARG_EVENT_RANGE_SEPARATOR);

        let i = Number(split[0]);
        const end = Number(split[1]) || i;
        while (i <= end)
            yield i++;
    }

    function* getAllEventIDs() {
        for (const event of $dataMap.events.filter(e => e))
            yield event.id;
    }

    function changeSelfSwitch(mapId, eventId, switchId, state) {
        let key = [mapId, eventId, switchId];
        let value = {
            [COMMAND_ARG_STATE_ON]: true,
            [COMMAND_ARG_STATE_OFF]: false,
            [COMMAND_ARG_STATE_TOGGLE]: !$gameSelfSwitches.value(key)
        }[state];
        $gameSelfSwitches.setValue(key, value);
    }
})();
