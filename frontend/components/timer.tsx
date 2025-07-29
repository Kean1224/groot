'use client';

import React, { useEffect, useState } from 'react';

export default function Timer({ endTime }: { endTime: string }) {
  const calculateTimeLeft = () => {
    const difference = +new Date(endTime) - +new Date();
    let timeLeft: {
      days?: number;
      hours?: number;
      minutes?: number;
      seconds?: number;
    } = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const formatTime = () => {
    if (!timeLeft.seconds && !timeLeft.minutes && !timeLeft.hours && !timeLeft.days) {
      return <span className="text-red-600 font-semibold">Auction Ended</span>;
    }

    return (
      <span className="text-yellow-700 font-semibold">
        {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
      </span>
    );
  };

  return (
    <div className="text-sm mt-2">
      ⏰ {formatTime()}
    </div>
  );
}
