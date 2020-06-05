/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2017, 2018 Vector Creations Ltd
Copyright 2020 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import * as React from "react";
import { createRef } from "react";
import { Room } from "matrix-js-sdk/src/models/room";
import classNames from 'classnames';
import { RovingTabIndexWrapper } from "../../../accessibility/RovingTabIndex";
import { _t } from "../../../languageHandler";
import AccessibleButton from "../../views/elements/AccessibleButton";
import RoomTile2 from "./RoomTile2";
import { ResizableBox, ResizeCallbackData } from "react-resizable";
import { ListLayout } from "../../../stores/room-list/ListLayout";
import { DefaultTagID, TagID } from "../../../stores/room-list/models";

/*******************************************************************
 *   CAUTION                                                       *
 *******************************************************************
 * This is a work in progress implementation and isn't complete or *
 * even useful as a component. Please avoid using it until this    *
 * warning disappears.                                             *
 *******************************************************************/

interface IProps {
    forRooms: boolean;
    rooms?: Room[];
    startAsHidden: boolean;
    label: string;
    showMessagePreviews: boolean;
    onAddRoom?: () => void;
    addRoomLabel: string;
    isInvite: boolean;
    layout: ListLayout;

    // TODO: Collapsed state
    // TODO: Group invites
    // TODO: Calls
    // TODO: forceExpand?
    // TODO: Header clicking
    // TODO: Spinner support for historical
}

interface IState {
}

export default class RoomSublist2 extends React.Component<IProps, IState> {
    private headerButton = createRef();

    private hasTiles(): boolean {
        return this.numTiles > 0;
    }

    private get numTiles(): number {
        // TODO: Account for group invites
        return (this.props.rooms || []).length;
    }

    private onAddRoom = (e) => {
        e.stopPropagation();
        if (this.props.onAddRoom) this.props.onAddRoom();
    };

    private onResize = (e: React.MouseEvent, data: ResizeCallbackData) => {
        const direction = e.movementY < 0 ? -1 : +1;
        const tileDiff = this.props.layout.pixelsToTiles(Math.abs(e.movementY)) * direction;
        this.props.layout.visibleTiles += tileDiff;
        this.forceUpdate(); // because the layout doesn't trigger a re-render
    };

    private onShowAllClick = () => {
        this.props.layout.visibleTiles = this.numTiles;
        this.forceUpdate(); // because the layout doesn't trigger a re-render
    };

    private renderTiles(): React.ReactElement[] {
        const tiles: React.ReactElement[] = [];

        if (this.props.rooms) {
            for (const room of this.props.rooms) {
                tiles.push(
                    <RoomTile2
                        room={room}
                        key={`room-${room.roomId}`}
                        showMessagePreview={this.props.showMessagePreviews}
                    />
                );
            }
        }

        return tiles;
    }

    private renderHeader(): React.ReactElement {
        // TODO: Handle badge count
        // const notifications = !this.props.isInvite
        //     ? RoomNotifs.aggregateNotificationCount(this.props.rooms)
        //     : {count: 0, highlight: true};
        // const notifCount = notifications.count;
        // const notifHighlight = notifications.highlight;

        // TODO: Title on collapsed
        // TODO: Incoming call box

        return (
            <RovingTabIndexWrapper inputRef={this.headerButton}>
                {({onFocus, isActive, ref}) => {
                    // TODO: Use onFocus
                    const tabIndex = isActive ? 0 : -1;

                    // TODO: Collapsed state
                    // TODO: Handle badge count
                    // let badge;
                    // if (true) { // !isCollapsed
                    //     const showCount = localStorage.getItem("mx_rls_count") || notifHighlight;
                    //     const badgeClasses = classNames({
                    //         'mx_RoomSublist2_badge': true,
                    //         'mx_RoomSublist2_badgeHighlight': notifHighlight,
                    //         'mx_RoomSublist2_badgeEmpty': !showCount,
                    //     });
                    //     // Wrap the contents in a div and apply styles to the child div so that the browser default outline works
                    //     if (notifCount > 0) {
                    //         const count = <div>{FormattingUtils.formatCount(notifCount)}</div>;
                    //         badge = (
                    //             <AccessibleButton
                    //                 tabIndex={tabIndex}
                    //                 className={badgeClasses}
                    //                 aria-label={_t("Jump to first unread room.")}
                    //             >
                    //                 {showCount ? count : null}
                    //             </AccessibleButton>
                    //         );
                    //     } else if (this.props.isInvite && this.hasTiles()) {
                    //         // Render the `!` badge for invites
                    //         badge = (
                    //             <AccessibleButton
                    //                 tabIndex={tabIndex}
                    //                 className={badgeClasses}
                    //                 aria-label={_t("Jump to first invite.")}
                    //             >
                    //                 <div>
                    //                     {FormattingUtils.formatCount(this.numTiles)}
                    //                 </div>
                    //             </AccessibleButton>
                    //         );
                    //     }
                    // }

                    // TODO: Aux button
                    // let addRoomButton = null;
                    // if (!!this.props.onAddRoom) {
                    //     addRoomButton = (
                    //         <AccessibleTooltipButton
                    //             tabIndex={tabIndex}
                    //             onClick={this.onAddRoom}
                    //             className="mx_RoomSublist2_addButton"
                    //             title={this.props.addRoomLabel || _t("Add room")}
                    //         />
                    //     );
                    // }

                    // TODO: a11y (see old component)
                    return (
                        <div className={"mx_RoomSublist2_headerContainer"}>
                            <AccessibleButton
                                inputRef={ref}
                                tabIndex={tabIndex}
                                className={"mx_RoomSublist2_headerText"}
                                role="treeitem"
                                aria-level="1"
                            >
                                <span>{this.props.label}</span>
                            </AccessibleButton>
                        </div>
                    );
                }}
            </RovingTabIndexWrapper>
        );
    }

    public render(): React.ReactElement {
        // TODO: Proper rendering
        // TODO: Error boundary

        const tiles = this.renderTiles();

        const classes = classNames({
            // TODO: Proper collapse support
            'mx_RoomSublist2': true,
            'mx_RoomSublist2_collapsed': false, // len && isCollapsed
        });

        let content = null;
        if (tiles.length > 0) {
            // TODO: Lazy list rendering
            // TODO: Whatever scrolling magic needs to happen here
            const layout = this.props.layout; // to shorten calls
            const minTilesPx = layout.tilesToPixels(Math.min(tiles.length, layout.minVisibleTiles));
            const maxTilesPx = layout.tilesToPixels(tiles.length);
            const tilesPx = layout.tilesToPixels(Math.min(tiles.length, layout.visibleTiles));
            let handles = ['s'];
            if (layout.visibleTiles >= tiles.length && tiles.length <= layout.minVisibleTiles) {
                handles = []; // no handles, we're at a minimum
            }

            // TODO: Remove Math hacks
            let nVisible = Math.floor(layout.visibleTiles);
            if (localStorage.getItem("mx_rl_mathfn")) {
                nVisible = Math[localStorage.getItem("mx_rl_mathfn")](layout.visibleTiles);
            }
            const visibleTiles = tiles.slice(0, nVisible);

            // If we're hiding rooms, show a 'show more' button to the user. This button
            // replaces the last visible tile, so will always show 2+ rooms. We do this
            // because if it said "show 1 more room" we had might as well show that room
            // instead. We also replace the last item so we don't have to adjust our math
            // on pixel heights, etc. It's much easier to pretend the button is a tile.
            if (tiles.length > nVisible) {
                // we have a cutoff condition - add the button to show all

                // we +1 to account for the room we're about to hide with our 'show more' button
                const numMissing = (tiles.length - visibleTiles.length) + 1;

                // TODO: CSS TBD
                // TODO: Make this an actual tile
                const moreTileHeightPx = layout.tileHeight;
                visibleTiles.splice(visibleTiles.length - 1, 1, (
                    <div
                        onClick={this.onShowAllClick}
                        style={{height: moreTileHeightPx, lineHeight: moreTileHeightPx, cursor: 'pointer'}}
                        key='showall'
                    >
                        {_t("Show %(n)s more", {n: numMissing})}
                    </div>
                ));
            }
            content = (
                <ResizableBox
                    width={-1}
                    height={tilesPx}
                    axis="y"
                    minConstraints={[-1, minTilesPx]}
                    maxConstraints={[-1, maxTilesPx]}
                    resizeHandles={handles}
                    onResize={this.onResize}
                    className="mx_RoomSublist2_resizeBox"
                >
                    {visibleTiles}
                </ResizableBox>
            )
        }

        // TODO: onKeyDown support
        return (
            <div
                className={classes}
                role="group"
                aria-label={this.props.label}
            >
                {this.renderHeader()}
                {content}
            </div>
        );
    }
}
