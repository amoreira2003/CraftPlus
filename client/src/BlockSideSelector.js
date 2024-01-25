import React, { useState } from 'react';
import './BlockSideSelector.css';

const BlockSideSelector = () => {
  const [selectedSide, setSelectedSide] = useState('');


  const handleSideSelect = (side) => {
    setSelectedSide(side);
    toggleBlockSelection(side);

  }

  const toggleBlockSelection = (side) => {
    switch (side) {
      case 'top':
        setTopSelected(!topSelected);
        break;
      case 'left':
        setLeftSelected(!leftSelected);
        break;
      case 'front':
        setFrontSelected(!frontSelected);
        break;
      case 'right':
        setRightSelected(!rightSelected);
        break;
      case 'bottom':
        setBottomSelected(!bottomSelected);
        break;
      case 'back':
        setBackSelected(!backSelected);
        break;
      default:
        break;
    }
  }

  return (
    <div className="block-selector">
      <div className="block-row">
        <div className={`block top ${topSelected ? 'selected' : ''}`} onClick={() => handleSideSelect('top')}>Top</div>
      </div>
      <div className="block-row">
        <div className={`block left ${leftSelected ? 'selected' : ''}`} onClick={() => handleSideSelect('left')}>Left</div>
        <div className={`block front ${frontSelected ? 'selected' : ''}`} onClick={() => handleSideSelect('front')}>Front</div>
        <div className={`block right ${rightSelected ? 'selected' : ''}`} onClick={() => handleSideSelect('right')}>Right</div>
      </div>
      <div className="leftmargin block-row">
        <div/>
        <div className={`block bottom ${bottomSelected ? 'selected' : ''}`} onClick={() => handleSideSelect('bottom')}>Bottom</div>
        <div className={`block back ${backSelected ? 'selected' : ''}`} onClick={() => handleSideSelect('back')}>Back</div>
      </div>
      <div className="selected-info">Selected Side: {selectedSide}</div>
    </div>
  );
}

export default BlockSideSelector;
