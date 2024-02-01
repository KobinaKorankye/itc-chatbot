import React from 'react';
import Lottie from 'react-lottie';
import chat_loading from './chat_loading_dark.json'
import itc_agent from './itc_agent.json'

const animations = {
  itc_agent, chat_loading
}

export default function Loader({ width, height, animationName}) {
    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animations[animationName]||chat_loading,
        rendererSettings: {
          preserveAspectRatio: "xMidYMid slice"
        }
      };
    
    return (
      <div>
        <Lottie 
          options={defaultOptions}
          height={height||400}
          width={width||400}
        />
      </div>
    );
  }