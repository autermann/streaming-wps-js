/* Copyright (c) 2014, Lawrence Davis
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 * this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 * notice, this list of conditions and the following disclaimer in the
 * documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER
 * OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
(function() {
  if (!HTMLElement.prototype.querySelectorAll) {
    throw new Error('rootedQuerySelectorAll: This polyfill can only be used with browsers that support querySelectorAll');
  }
  var container = document.createElement('div');
  try {
    container.querySelectorAll(':scope *');
  } catch (e) {
    var scopeRE = /^\s*:scope/gi;
    function overrideNodeMethod(prototype, methodName) {
      var oldMethod = prototype[methodName];
      prototype[methodName] = function(query) {
        var nodeList, gaveId = false, gaveContainer = false;
        if (query.match(scopeRE)) {
          query = query.replace(scopeRE, '');
          if (!this.parentNode) {
            container.appendChild(this);
            gaveContainer = true;
          }
          parentNode = this.parentNode;
          if (!this.id) {
            this.id = 'rootedQuerySelector_id_'+(new Date()).getTime();
            gaveId = true;
          }
          nodeList = oldMethod.call(parentNode, '#'+this.id+' '+query);
          if (gaveId) { this.id = ''; }
          if (gaveContainer) { container.removeChild(this); }
          return nodeList;
        }
        else {
          return oldMethod.call(this, query);
        }
      };
    }
    overrideNodeMethod(HTMLElement.prototype, 'querySelector');
    overrideNodeMethod(HTMLElement.prototype, 'querySelectorAll');
  }
}());