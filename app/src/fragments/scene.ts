import gql from "graphql-tag";

export default gql`
  fragment SceneFragment on Scene {
    _id
    name
    releaseDate
    description
    rating
    favorite
    bookmark
    labels {
      _id
      name
    }
    thumbnail {
      _id
    }
    meta {
      size
      duration
      dimensions {
        width
        height
      }
    }
    watches
    streamLinks
    path
  }
`;
