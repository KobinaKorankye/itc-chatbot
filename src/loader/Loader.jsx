import React from 'react';
import Lottie from 'react-lottie';
import chat_loading from './chat_loading_dark.json'
import pulse_red from './pulse_red.json'
import itc_agent from './itc_agent.json'
import itc_bothead from './itc_bothead.json'
import itc_bot from './itc_bot.json'
import uploading from './uploading.json'

const animations = {
  itc_agent, chat_loading, pulse: pulse_red, itc_bothead, itc_bot, uploading
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