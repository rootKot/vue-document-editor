
/**
 * Utility function that acts like an Array.filter on childNodes of "container"
 * @param {HTMLElement} container 
 * @param {string} s_tag 
 */
function find_sub_child_sibling_node (container, s_tag){
  if(!container || !s_tag) return false;
  const child_nodes = container.childNodes;
  for(let i = 0; i < child_nodes.length; i++) {
    if(child_nodes[i].s_tag == s_tag) return child_nodes[i];
  }
  return false;
}


/**
 * This function moves every sub-child of argument "child" to the start of the "child_sibling"
 * argument, beginning from the last child, with word splitting and format preserving.
 * Typically, "child" is the current page which content overflows, and "child_sibling" is the 
 * next page.
 * @param {Object} page Element to take children from (current page)
 * @param {HTMLElement} child Element to take children from (current page)
 * @param {HTMLElement} child_sibling Element to copy children to (next page)
 * @param {Function} stop_condition Check function that returns a boolean if content doesn't overflow anymore
 * @param {Boolean} not_first_child Should be unset. Used internally to let at least one child in the page
 */
function move_children_forward_recursively (page, child, child_sibling, stop_condition, not_first_child) {
  // if the child still has nodes and the current page still overflows

  while(child.childNodes.length && !stop_condition()){

    // check if page has only one child tree left
    not_first_child = not_first_child || (child.childNodes.length != 1);

    // select the last sub-child
    const sub_child = child.lastChild;

    // if it is a text node, move its content to next page word(/space) by word
    if(sub_child.nodeType == Node.TEXT_NODE){
      let sub_child_hashes = sub_child.textContent.match(/(\s|\S+)/g);
      // console.log({sub_child_hashes})

      const sub_child_continuation = document.createTextNode('');
      child_sibling.prepend(sub_child_continuation);
      let l = sub_child_hashes ? sub_child_hashes.length : 0;

      let j = 0;
      let sub_child_hashes_temp = [];
      for(let i = 0; i < l; i++) {
        if (sub_child_hashes[i] === ' ' && i !== 0) {
          continue;
        }
        if (i + 1 < l && sub_child_hashes[i + 1] === ' ') {
          sub_child_hashes_temp[j] = sub_child_hashes[i] + ' ';
          i++;
        } else {
          sub_child_hashes_temp[j] = sub_child_hashes[i];
        }
        j ++;
      }

      sub_child_hashes = sub_child_hashes_temp;
      // console.log({sub_child_hashes_temp})
      l = sub_child_hashes ? sub_child_hashes.length : 0;
      let sub_child_hashes_splice_string_start = '';
      let sub_child_hashes_splice_string_end = '';
      let sub_child_hashes_spliced_strings_start = [];
      let sub_child_hashes_spliced_strings_end = [];

      for(let i = 0; i < l; i++) {
        sub_child_hashes_splice_string_start += sub_child_hashes[i];
        sub_child_hashes_splice_string_end = sub_child_hashes[l - i - 1] + sub_child_hashes_splice_string_end;

        if (i + 1 < l) {
          sub_child_hashes_spliced_strings_start[i + 1] = sub_child_hashes_splice_string_start;
        }
        sub_child_hashes_spliced_strings_end[l - i - 1] = sub_child_hashes_splice_string_end;
      }
      sub_child_hashes_spliced_strings_start[0] = '';

      // console.log({sub_child_hashes_spliced_strings_start});
      // console.log({sub_child_hashes_spliced_strings_end});

      let count = 0;
      let startIndex = 0;
      let endIndex = l;

      let isDone = false;
      while (!isDone) {
        //console.log('new test count')
        let middleIndex = startIndex + Math.floor((endIndex - startIndex) * 0.5);
        // console.log('start', startIndex, 'middle', middleIndex, 'end', endIndex)
        sub_child.textContent = sub_child_hashes_spliced_strings_start[middleIndex];
        sub_child_continuation.textContent = sub_child_hashes_spliced_strings_end[middleIndex];
        if(stop_condition()) {
          if (middleIndex === startIndex) {
            // if (page.lastParagraphTextContent !== undefined && page.lastParagraphTextContent === sub_child_hashes_spliced_strings_start[middleIndex]) {
            //   page.contentNotModifyNextPage = true;
            // } else {
            //   page.contentNotModifyNextPage = false;
            // }
            // page.lastParagraphTextContent = sub_child_hashes_spliced_strings_start[middleIndex];
            return true;
          }
          startIndex = middleIndex;
        } else {
          if (middleIndex === startIndex) {
            isDone = true;
          }
          endIndex = middleIndex;
        }

        count ++;
        if (count > 500) {
          isDone = true;
        }
      }





      /*for(let i = 0; i < l; i++) {
        console.log('old test count')
        //if(i == l - 1 && !not_first_child) return; // never remove the first word of the page
        sub_child.textContent = sub_child_hashes_spliced_strings_start[l - i - 1];
        sub_child_continuation.textContent = l - i -1 === l ? ' ': sub_child_hashes_spliced_strings_end[l - i - 1];

        //sub_child.textContent = sub_child_hashes.slice(0, sub_child_hashes_splice_pos).join('');
        // sub_child_continuation.textContent = sub_child_hashes.slice(l - i - 1, l).join('');
        if(stop_condition()) {
          sub_child_hashes_spliced_strings_start = [];
          sub_child_hashes_spliced_strings_end = [];
          // console.log('sub_child', sub_child.textContent)
          // console.log('sub_child_continuation', sub_child_continuation.textContent)

          return;
        }
      }*/
    }

    // if it is a node with no content (e.g. <img>), or a header title (e.g. <h1>) we simply move it
    else if(!sub_child.childNodes.length || sub_child.tagName.match(/h\d/i)) {
      // just prevent moving the last child of the page
      if(!not_first_child){
        console.log("Move-forward: first child reached with no stop condition. Aborting");
        return;
      }
      child_sibling.prepend(sub_child);
    }

    // for every other node that is not text and not the first child, clone it recursively to next page
    else {
      // check if sub child has already been cloned before
      let sub_child_sibling = find_sub_child_sibling_node(child_sibling, sub_child.s_tag);

      // if not, create it and watermark the relationship with a random tag
      if(!sub_child_sibling) {
        if(!sub_child.s_tag) {
          const new_random_tag = Math.random().toString(36).slice(2, 8);
          sub_child.s_tag = new_random_tag;
        }
        sub_child_sibling = sub_child.cloneNode(false);
        sub_child_sibling.s_tag = sub_child.s_tag;
        child_sibling.prepend(sub_child_sibling);
      }

      // then move/clone its children and sub-children recursively
      move_children_forward_recursively(page, sub_child, sub_child_sibling, stop_condition, not_first_child);
      sub_child_sibling.normalize(); // merge consecutive text nodes
    }

    // if sub_child was a container that was cloned and is now empty, we clean it
    if(child.contains(sub_child)){
      if(sub_child.childNodes.length == 0 || sub_child.innerHTML == "") child.removeChild(sub_child);
      else if(!stop_condition()) {
        // the only case when it can be non empty should be when stop_condition is now true
        console.log("sub_child:", sub_child, "that is in child:", child);
        throw Error("Document editor is trying to remove a non-empty sub-child. This "
      + "is a bug and should not happen. Please report a repeatable set of actions that "
      + "leaded to this error to https://github.com/motla/vue-document-editor/issues/new");
      }
    }
  }
}

function separateParagraph(startIndex, endIndex, sub_child, sub_child_continuation, sub_child_hashes_spliced_strings_start, sub_child_hashes_spliced_strings_end, stop_condition, done) {
  setTimeout(() => {
    let middleIndex = startIndex + Math.floor((endIndex - startIndex) / 2);
    console.log('start', startIndex, 'middle', middleIndex, 'end', endIndex)
    // console.log(sub_child_hashes_spliced_strings_start[middleIndex])
    sub_child.textContent = sub_child_hashes_spliced_strings_start[middleIndex];
    sub_child_continuation.textContent = sub_child_hashes_spliced_strings_end[middleIndex];
    if(stop_condition()) {
      if (middleIndex === startIndex) {
        done(true);
        return true;
      }
      separateParagraph(middleIndex, endIndex, sub_child, sub_child_continuation, sub_child_hashes_spliced_strings_start, sub_child_hashes_spliced_strings_end, stop_condition, done)
    } else {
      if (middleIndex === startIndex) {
        done(false);
        return false;
      }
      separateParagraph(startIndex, middleIndex, sub_child, sub_child_continuation, sub_child_hashes_spliced_strings_start, sub_child_hashes_spliced_strings_end, stop_condition, done)
    }
  })
  // console.log('new test count')

}

/**
 * This function moves the first element from "next_page_html_div" to the end of "page_html_div", with
 * merging sibling tags previously watermarked by "move_children_forward_recursively", if any.
 * @param {HTMLElement} page_html_div Current page element
 * @param {HTMLElement} next_page_html_div Next page element
 * @param {Function} stop_condition Check function that returns a boolean if content overflows
 */
function move_children_backwards_with_merging (page_html_div, next_page_html_div, stop_condition) {

  // loop until content is overflowing
  while(!stop_condition()){

    // find first child of next page
    const first_child = next_page_html_div.firstChild;

    // merge it at the end of the current page
    var merge_recursively = (container, elt) => {
      // check if child had been splitted (= has a sibling on previous page)
      const elt_sibling = find_sub_child_sibling_node(container, elt.s_tag);
      if(elt_sibling && elt.childNodes.length) {
        // then dig for deeper children, in case of
        merge_recursively(elt_sibling, elt.firstChild);
      }
      // else move the child inside the right container at current page
      else {
        container.append(elt);
        container.normalize();
      }
    }
    merge_recursively(page_html_div, first_child);
  }
}

export {
  move_children_forward_recursively,
  move_children_backwards_with_merging
};
