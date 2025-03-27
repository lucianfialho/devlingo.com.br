"use client";
import { Button } from "@/components/ui/button";
import React, { useState } from 'react'

function UseFulnessFeedback() {
    const [feedback, setFeedback] = useState(null);
    
    return (
      <div className="mt-8 border-t pt-4">
        <p className="text-center text-gray-700 mb-2">Este termo foi útil para você?</p>
        <div className="flex justify-center space-x-4">
          <Button 
            variant={feedback === 'yes' ? 'default' : 'outline'}
            onClick={() => setFeedback('yes')}
            className="flex items-center gap-1"
          >
            👍 Sim
          </Button>
          <Button 
            variant={feedback === 'no' ? 'default' : 'outline'}
            onClick={() => setFeedback('no')}
            className="flex items-center gap-1"
          >
            👎 Não
          </Button>
        </div>
        {feedback === 'no' && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">Ajude-nos a melhorar!</p>
            <Button variant="link" className="text-sm">
              Sugerir uma melhoria
            </Button>
          </div>
        )}
        {feedback === 'yes' && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">Compartilhe este termo:</p>
            <div className="flex justify-center space-x-2 mt-2">
              <Button variant="outline" size="sm" className="text-blue-600">
                Twitter
              </Button>
              <Button variant="outline" size="sm" className="text-blue-800">
                LinkedIn
              </Button>
              <Button variant="outline" size="sm" className="text-green-600">
                WhatsApp
              </Button>
            </div>
          </div>
        )}
      </div>
    );
}

export default UseFulnessFeedback