export const TitleSection = (props: {
  videoPath: string;
  lessonPath: string;
  repoName: string;
}) => {
  return (
    <>
      <h1 className="text-2xl font-bold mb-1">{props.videoPath}</h1>
      <h2 className="text-sm font-medium mb-1">
        {props.repoName}
        {" - "}
        {props.lessonPath}
      </h2>
    </>
  );
};
