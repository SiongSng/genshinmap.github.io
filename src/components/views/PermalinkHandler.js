import React from 'react';
import { connect } from 'react-redux';

import { getURLParams, setBrowserClipboard } from '~/components/Util';
import { getElementPathById, getElementByPath } from '~/components/data/MapFeatures';
import { setPositionAndZoom, setToast } from '~/redux/ducks/ui';
import { t } from '~/components/i18n/Localization';
import { setFeatureDisplayed, setRouteDisplayed } from '~/redux/ducks/displayed';

const HIGHLIGHT_ZOOM_LEVEL = 9;

export const generatePermalink = (id) => {
  return `${window.location.host}/?id=${id}`;
};

export const copyPermalink = (id) => {
  setBrowserClipboard(generatePermalink(id));
};

/* eslint-disable no-shadow */
export const navigateToMarkerById = (
  id,
  setPositionAndZoom,
  showToast = null,
  displayFeature = null,
  displayRoute = null
) => {
  // Find which group has the ID.
  const elementPath = getElementPathById(id);
  if (elementPath == null) {
    console.error(`Path not found for ID: ${id}`);
    if (showToast != null) showToast(t('notification-permalink-fail-id'));
    return;
  }

  // Get the element associated with the ID.
  const [elementType, elementName, _elementId] = elementPath.split('/');
  const element = getElementByPath(elementPath);
  if (elementPath == null) {
    console.error(`Element not found for path: ${elementPath}`);
    if (showToast != null) showToast(t('notification-permalink-fail-id'));
    return;
  }

  // Move to the element's position.
  if (elementType === 'route') {
    setPositionAndZoom(
      { lat: element.coordinates[0][0], lng: element.coordinates[0][1] },
      HIGHLIGHT_ZOOM_LEVEL
    );
    // Display the route if it isn't already visible.
    if (displayRoute !== null) displayRoute(elementName);
    if (showToast != null) showToast(t('notification-permalink-route'));
  } else {
    setPositionAndZoom(
      { lat: element?.coordinates[0], lng: element?.coordinates[1] },
      HIGHLIGHT_ZOOM_LEVEL
    );
    // Display the route if it isn't already visible.
    if (displayFeature !== null) displayFeature(elementName);
    if (showToast != null) showToast(t('notification-permalink-feature'));
  }
};

// Note: The dispatchers generated by mapDispatchToProps
// shadow their associated action generators.
/* eslint-disable no-shadow */
const _PermalinkHandler = ({ setPositionAndZoom, showToast, displayFeature, displayRoute }) => {
  // Navigate to the marked permalink when the map starts.
  React.useEffect(() => {
    const urlParams = getURLParams();
    const id = (urlParams?.id ?? [null])[0];
    // End early if no ID was specified.
    if (id == null) return;

    navigateToMarkerById(id, setPositionAndZoom, showToast, displayFeature, displayRoute);
  }, []);

  // Don't render anything.
  return null;
};

const mapStateToProps = (_state) => ({});
const mapDispatchToProps = (dispatch) => ({
  showToast: (message) => dispatch(setToast(message, null, true, 6000)),
  setPositionAndZoom: (position, zoom) => dispatch(setPositionAndZoom(position, zoom)),
  displayFeature: (featureKey) => {
    dispatch(setFeatureDisplayed(featureKey, true));
  },
  displayRoute: (routeKey) => {
    dispatch(setRouteDisplayed(routeKey, true));
  },
});

const PermalinkHandler = connect(mapStateToProps, mapDispatchToProps)(_PermalinkHandler);

export default PermalinkHandler;
